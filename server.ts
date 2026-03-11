import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { MongoClient, ObjectId } from "mongodb";
import https from "https";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const JOTFORM_LINKS: Record<string, string> = {
  'איילון': 'https://form.jotform.com/232780982444060',
  'שומרה': 'https://form.jotform.com/232783244966467',
  'הראל': 'https://form.jotform.com/232784541483462',
  'שלמה': 'https://form.jotform.com/232785215879470',
  'חקלאי': 'https://form.jotform.com/232784907083464',
  'פניקס': 'https://form.jotform.com/232785448649473',
  'הכשרה': 'https://form.jotform.com/232784955516468',
  'מנורה': 'https://form.jotform.com/233192204698460',
};

// Ensure uploads and fonts directories exist
const uploadsDir = path.join(__dirname, "uploads");
const fontsDir = path.join(__dirname, "fonts");
[uploadsDir, fontsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

// Start font download in background immediately
ensureFonts().catch(e => {
  const logFile = path.join(uploadsDir, 'font_debug.log');
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Top-level ensureFonts error: ${e.message}\n`);
});

// Function to ensure fonts are available locally
async function downloadFile(url: string, dest: string): Promise<void> {
  const logFile = path.join(uploadsDir, 'font_debug.log');
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Starting download from ${url}\n`);
  
  try {
    const response = await fetch(url);
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Response status: ${response.status}\n`);
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Downloaded ${arrayBuffer.byteLength} bytes\n`);
    
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(dest, buffer);
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Saved to ${dest}\n`);
  } catch (e: any) {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Error: ${e.message}\n`);
    throw e;
  }
}

async function ensureFonts() {
  console.log("Starting ensureFonts...");
  const fonts = [
    {
      name: 'Rubik-Regular.ttf',
      urls: [
        'https://raw.githubusercontent.com/googlefonts/noto-fonts/master/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Regular.ttf',
        'https://github.com/googlefonts/noto-fonts/raw/master/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Regular.ttf'
      ]
    },
    {
      name: 'Rubik-Bold.ttf',
      urls: [
        'https://raw.githubusercontent.com/googlefonts/noto-fonts/master/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Bold.ttf',
        'https://github.com/googlefonts/noto-fonts/raw/master/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Bold.ttf'
      ]
    }
  ];

  for (const font of fonts) {
    const fontPath = path.join(fontsDir, font.name);
    if (!fs.existsSync(fontPath)) {
      console.log(`Downloading font ${font.name}...`);
      let downloaded = false;
      for (const url of font.urls) {
        try {
          await downloadFile(url, fontPath);
          console.log(`Successfully downloaded ${font.name} from ${url}`);
          downloaded = true;
          break;
        } catch (e) {
          console.error(`Failed to download ${font.name} from ${url}:`, e);
        }
      }
      if (!downloaded) {
        console.error(`CRITICAL: Could not download font ${font.name} from any source.`);
      }
    } else {
      console.log(`Font ${font.name} already exists locally.`);
    }
  }
}

// MongoDB Configuration
const mongoUri = process.env.MONGODB_CONNECTION_STRING;
const dbName = process.env.MONGODB_DB_NAME || "claims_app";

if (!mongoUri) {
  console.error("MONGODB_CONNECTION_STRING is missing in environment variables.");
  // Don't exit, allow server to start so user can see the UI
}

let client: MongoClient | null = null;
let db: any = null;
let isDbConnected = false;

async function connectToMongo() {
  const mongoUri = process.env.MONGODB_CONNECTION_STRING;
  if (!mongoUri) {
    console.error("MONGODB_CONNECTION_STRING is missing.");
    isDbConnected = false;
    return;
  }

  try {
    if (!client) {
      console.log(`Attempting to connect to MongoDB... (URI length: ${mongoUri.length})`);
      client = new MongoClient(mongoUri, {
        connectTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
      });
    }
    
    await client.connect();
    db = client.db(dbName);
    isDbConnected = true;
    console.log(`Connected to MongoDB: ${dbName}`);
    
    // Initialize collections and indexes
    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    await db.collection("claims").createIndex({ created_at: -1 });
    await db.collection("claims").createIndex({ claim_number: 1 });
    await db.collection("entities").createIndex({ name: 1 });
    await db.collection("claim_handlers").createIndex({ name: 1 });
    await db.collection("agents").createIndex({ name: 1 });
    await db.collection("claim_logs").createIndex({ claim_id: 1 });
    await db.collection("questionnaires").createIndex({ id: 1 }, { unique: true });

    // Ensure default admin exists
    const admin = await db.collection("users").findOne({ username: "admin" });
    if (!admin) {
      await db.collection("users").insertOne({
        username: "admin",
        password: "admin123",
        role: "admin",
        created_at: new Date()
      });
      console.log("Default admin user created in MongoDB.");
    }

    // Seed initial entities if empty
    const entityCount = await db.collection("entities").countDocuments();
    if (entityCount === 0) {
      const initialEntities = [
        { type: 'garage', name: 'מוסך המרכז', phone: '03-1234567', email: 'center@garage.com', created_at: new Date() },
        { type: 'garage', name: 'מוסך הצפון', phone: '04-1234567', email: 'north@garage.com', created_at: new Date() },
        { type: 'appraiser', name: 'שמאי כהן', phone: '050-1234567', email: 'cohen@appraiser.com', created_at: new Date() },
        { type: 'appraiser', name: 'שמאי לוי', phone: '052-1234567', email: 'levi@appraiser.com', created_at: new Date() },
        { type: 'insurance', name: 'הפניקס', phone: '03-5394000', email: 'claims@fnx.co.il', created_at: new Date() },
        { type: 'insurance', name: 'שומרה', phone: '03-5659555', email: 'claims@shomera.co.il', created_at: new Date() },
        { type: 'insurance', name: 'שלמה ביטוח', phone: '03-9206900', email: 'claims@shlomo-bit.co.il', created_at: new Date() },
        { type: 'insurance', name: 'איילון', phone: '1-700-72-72-27', email: 'claims@ayalon-ins.co.il', created_at: new Date() },
        { type: 'insurance', name: 'מנורה', phone: '03-7107107', email: 'claims@menora.co.il', created_at: new Date() },
        { type: 'insurance', name: 'הראל', phone: '03-7547777', email: 'claims@harel-ins.co.il', created_at: new Date() },
        { type: 'insurance', name: 'מגדל', phone: '03-7333333', email: 'claims@migdal.co.il', created_at: new Date() },
        { type: 'insurance', name: 'אנקור', phone: '03-6111111', email: 'claims@nkr.co.il', created_at: new Date() },
        { type: 'insurance', name: 'ביטוח ישיר', phone: '03-5555555', email: 'claims@555.co.il', created_at: new Date() },
        { type: 'insurance', name: '9 מיליון', phone: '03-9000000', email: 'claims@9000000.co.il', created_at: new Date() },
        { type: 'insurance', name: 'ליברה', phone: '03-7777777', email: 'claims@lbr.co.il', created_at: new Date() }
      ];
      await db.collection("entities").insertMany(initialEntities);
      console.log("Initial entities seeded.");
    }

    // Seed initial agents if empty
    const agentCount = await db.collection("agents").countDocuments();
    if (agentCount === 0) {
      const initialAgents = [
        { name: 'סוכן ראשי', phone: '050-0000000', email: 'main@agent.com', created_at: new Date() },
        { name: 'סוכן משנה א', phone: '052-0000000', email: 'sub1@agent.com', created_at: new Date() }
      ];
      await db.collection("agents").insertMany(initialAgents);
      console.log("Initial agents seeded.");
    }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    isDbConnected = false;
  }
}

async function startServer() {
  console.log("Starting server initialization...");
  
  const app = express();
  const PORT = 3000;

  // Immediate health check route before any middleware or DB connection
  app.get("/api/ping", (req, res) => {
    res.json({ status: "pong", timestamp: new Date().toISOString() });
  });

  // Middleware to ensure DB is connected for API routes
  app.use("/api", (req, res, next) => {
    // Skip check for ping and debug/db
    if (req.path === "/ping" || req.path === "/debug/db") return next();
    
    if (!db || !isDbConnected) {
      console.warn(`[DB Check] Database not connected for request: ${req.originalUrl}`);
      return res.status(503).json({ 
        error: "השרת עדיין בתהליך אתחול או שאינו מחובר למסד הנתונים. אנא נסה שוב בעוד מספר שניות.",
        dbStatus: isDbConnected ? "connected_no_db" : "disconnected",
        details: "The server is unable to connect to MongoDB. Please ensure the connection string is valid."
      });
    }
    next();
  });

  // Start connection in background
  connectToMongo().catch(err => {
    console.error("Initial MongoDB connection background error:", err);
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use("/uploads", express.static(uploadsDir));
  
  // Short Redirect Routes for WhatsApp
  app.get("/go/form/:company", (req, res) => {
    const { company } = req.params;
    const link = JOTFORM_LINKS[company];
    if (link) return res.redirect(link);
    res.status(404).send("Form not found");
  });

  app.get("/go/s/:id", (req, res) => {
    const { id } = req.params;
    const party = req.query.p || 'customer';
    res.redirect(`${process.env.APP_URL || ''}/status/${id}?party=${party}`);
  });

  // File Retrieval Route with MongoDB fallback
  app.get("/uploads/:filename", async (req, res) => {
    const { filename } = req.params;
    const localPath = path.join(uploadsDir, filename);

    // 1. Try serving from local disk first
    if (fs.existsSync(localPath)) {
      return res.sendFile(localPath);
    }

    // 2. Fallback to MongoDB if local file is missing (e.g. after restart)
    try {
      if (!db) await connectToMongo();
      if (db) {
        const file = await db.collection("files").findOne({ filename });
        if (file && file.data) {
          // Restore to disk for faster subsequent access
          fs.writeFileSync(localPath, file.data.buffer);
          res.contentType(file.mimeType);
          return res.send(file.data.buffer);
        }
      }
    } catch (error) {
      console.error("Error retrieving file from MongoDB:", error);
    }

    res.status(404).send("הקובץ לא נמצא בשרת. ייתכן שהשרת אותחל והקבצים נמחקו.");
  });

  // Multer configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const originalName = file.originalname || 'upload';
      cb(null, uniqueSuffix + path.extname(originalName));
    }
  });
  const upload = multer({ storage });

  // File Upload Route with error handling
  app.post("/api/upload", (req, res, next) => {
    console.log("Received upload request");
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: `שגיאת העלאה: ${err.message}` });
      } else if (err) {
        console.error("Unknown upload error:", err);
        return res.status(500).json({ error: "שגיאה פנימית בהעלאת הקובץ" });
      }
      console.log("File uploaded successfully to disk:", req.file?.filename);
      next();
    });
  }, async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "לא נבחר קובץ להעלאה" });
    
    try {
      // Store in MongoDB for persistence across container restarts
      const fileData = fs.readFileSync(req.file.path);
      if (db) {
        await db.collection("files").insertOne({
          filename: req.file.filename,
          mimeType: req.file.mimetype,
          data: fileData,
          created_at: new Date()
        });
      }
      
      res.json({ path: `/uploads/${req.file.filename}` });
    } catch (error: any) {
      console.error("Error saving file to MongoDB:", error);
      // Still return the path even if MongoDB save fails, so it works at least temporarily
      res.json({ path: `/uploads/${req.file!.filename}` });
    }
  });

  // Health Check & Reconnect
  app.get("/api/debug/db", async (req, res) => {
    if (!isDbConnected || !db) {
      // Try to reconnect if not connected
      await connectToMongo();
    }
    
    if (!isDbConnected || !db) {
      return res.json({ 
        status: "error", 
        message: "Database not connected", 
        configured: !!process.env.MONGODB_CONNECTION_STRING 
      });
    }
    try {
      const collections = await db.listCollections().toArray();
      res.json({ 
        status: "ok", 
        collections: collections.map((c: any) => c.name), 
        configured: true,
        dbName: dbName
      });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message, configured: true });
    }
  });

  // Public API Routes for Claim Updates (No Auth Required)
  app.get("/api/public/claims/:id/info", async (req, res) => {
    const { id } = req.params;
    try {
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
      const claim = await db.collection("claims").findOne({ _id: new ObjectId(id) });
      if (!claim) return res.status(404).json({ error: "Claim not found" });
      
      // Return only non-sensitive info
      res.json({
        customer_name: claim.customer_name,
        car_number: claim.car_number,
        car_model: claim.car_model,
        status: claim.status,
        claim_type: claim.claim_type,
        claim_date: claim.claim_date,
        policy_number: claim.policy_number,
        insurance_company: claim.insurance_company,
        created_at: claim.created_at,
        estimated_processing_days: claim.estimated_processing_days,
        public_notes: claim.public_notes,
        requested_docs: claim.requested_docs || [],
        requested_docs_customer: claim.requested_docs_customer || [],
        requested_docs_appraiser: claim.requested_docs_appraiser || [],
        requested_docs_garage: claim.requested_docs_garage || [],
        // Include document paths so they can be viewed
        claim_form_path: claim.claim_form_path,
        appraiser_report_path: claim.appraiser_report_path,
        appraiser_invoice_path: claim.appraiser_invoice_path,
        appraiser_photos_path: claim.appraiser_photos_path,
        garage_invoice_path: claim.garage_invoice_path,
        driver_license_path: claim.driver_license_path,
        driver_license_back_path: claim.driver_license_back_path,
        vehicle_license_path: claim.vehicle_license_path,
        id_copy_path: claim.id_copy_path,
        bank_confirmation_path: claim.bank_confirmation_path,
        no_claims_path: claim.no_claims_path,
        consent_form_path: claim.consent_form_path,
        police_report_path: claim.police_report_path,
        power_of_attorney_path: claim.power_of_attorney_path,
        no_submission_path: claim.no_submission_path,
        lien_confirmation_path: claim.lien_confirmation_path,
        accountant_confirmation_path: claim.accountant_confirmation_path
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/public/claims/:id/updates", async (req, res) => {
    const { id } = req.params;
    try {
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
      const logs = await db.collection("claim_logs").find({ claim_id: id }).sort({ created_at: -1 }).toArray();
      res.json(logs.map((l: any) => ({
        id: l._id.toString(),
        content: l.content,
        created_at: l.created_at
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/public/claims/:id/documents", async (req, res) => {
    const { id } = req.params;
    const { field, path: uploadedPath } = req.body;
    const isMultiple = ['appraiser_report_path', 'appraiser_invoice_path', 'appraiser_photos_path', 'garage_invoice_path'].includes(field);

    try {
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
      
      const claim = await db.collection("claims").findOne({ _id: new ObjectId(id) });
      if (!claim) return res.status(404).json({ error: "Claim not found" });

      let update;
      if (isMultiple) {
        // Ensure the field is an array before using $addToSet
        const currentVal = claim[field];
        const pathsToAdd = Array.isArray(uploadedPath) ? uploadedPath : [uploadedPath];
        
        if (!Array.isArray(currentVal)) {
          // If it's not an array (e.g. empty string or null), initialize it as an array with the new paths
          const initialPaths = currentVal && typeof currentVal === 'string' ? [currentVal, ...pathsToAdd] : pathsToAdd;
          update = {
            $set: {
              [field]: [...new Set(initialPaths.filter(Boolean))],
              last_activity_at: new Date(),
              has_customer_updates: true
            },
            $addToSet: { customer_updated_docs: field }
          };
        } else {
          update = { 
            $addToSet: { 
              [field]: { $each: pathsToAdd },
              customer_updated_docs: field
            },
            $set: {
              last_activity_at: new Date(),
              has_customer_updates: true
            }
          };
        }
      } else {
        update = { 
          $set: { 
            [field]: uploadedPath,
            last_activity_at: new Date(),
            has_customer_updates: true
          },
          $addToSet: { customer_updated_docs: field }
        };
      }

      await db.collection("claims").updateOne(
        { _id: new ObjectId(id) },
        update
      );

      // Add a log entry
      const fieldLabels: Record<string, string> = {
        claim_form_path: 'טופס הודעה',
        appraiser_report_path: 'דוח שמאי',
        appraiser_invoice_path: 'חשבונית שמאי',
        appraiser_photos_path: 'תמונות שמאי',
        garage_invoice_path: 'חשבונית תיקון מוסך',
        driver_license_path: 'רשיון נהיגה',
        driver_license_back_path: 'רשיון נהיגה חלק אחורי',
        vehicle_license_path: 'רשיון רכב',
        id_copy_path: 'צילום ת.ז',
        bank_confirmation_path: 'אישור ניהול חשבון',
        no_claims_path: 'אישור אי תביעות',
        consent_form_path: 'כתב ויתור סודיות',
        police_report_path: 'אישור משטרה',
        power_of_attorney_path: 'ייפוי כוח',
        no_submission_path: 'אישור אי הגשה',
        lien_confirmation_path: 'אישור הסרת שעבוד',
        accountant_confirmation_path: 'אישור רואה חשבון',
        policy_file_path: 'פוליסה',
        demand_letter_path: 'מכתב דרישה'
      };

      const partyName = req.query.party === 'appraiser' ? 'השמאי' : 
                        req.query.party === 'garage' ? 'המוסך' : 'הלקוח';

      await db.collection("claim_logs").insertOne({
        claim_id: id,
        username: partyName,
        content: `${partyName} העלה מסמך: ${fieldLabels[field] || field}`,
        created_at: new Date()
      });

      // Special handling for appraiser photos: send to email
      if (field === 'appraiser_photos_path') {
        try {
          const claim = await db.collection("claims").findOne({ _id: new ObjectId(id) });
          const adminEmail = "uv.levari@gmail.com";
          const transporter = await getTransporter();
          
          // If multiple paths, we send all
          const paths = Array.isArray(uploadedPath) ? uploadedPath : [uploadedPath];
          const attachments = paths.map((p: string) => {
            const absPath = path.join(__dirname, p.startsWith('/') ? p.slice(1) : p);
            return {
              filename: `photos_${claim.car_number}${path.extname(p)}`,
              path: absPath
            };
          });
          
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@claims-app.com",
            to: adminEmail,
            subject: `תמונות שמאי חדשות - ${claim.customer_name} - רכב ${claim.car_number}`,
            text: `התקבלו תמונות חדשות מהשמאי עבור הלקוח ${claim.customer_name}.\nמצורף הקובץ.`,
            attachments
          });
          console.log(`Appraiser photos sent to ${adminEmail}`);
        } catch (emailError) {
          console.error("Error sending appraiser photos email:", emailError);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for user: ${username}`);
    
    try {
      const user = await db.collection("users").findOne({ username, password });
      if (user) {
        console.log("Login successful");
        const { password: _, ...userWithoutPassword } = user;
        // Convert _id to id for frontend compatibility
        return res.json({ ...userWithoutPassword, id: user._id.toString() });
      } else {
        console.log("Login failed");
        res.status(401).json({ error: "שם משתמש או סיסמה שגויים" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User Management (Admin only)
  app.get("/api/users", async (req, res) => {
    try {
      const users = await db.collection("users").find().toArray();
      res.json(users.map((u: any) => ({ ...u, id: u._id.toString() })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    const { username, password, role, email, phone } = req.body;
    try {
      const result = await db.collection("users").insertOne({
        username,
        password,
        role,
        email,
        phone,
        created_at: new Date()
      });
      res.json({ id: result.insertedId.toString() });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ error: "שם המשתמש כבר קיים" });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const { username, password, role, email, phone } = req.body;
    try {
      await db.collection("users").updateOne(
        { _id: new ObjectId(id) },
        { $set: { username, password, role, email, phone } }
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.collection("users").deleteOne({ _id: new ObjectId(id) });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Routes for Claims
  app.get("/api/claims", async (req, res) => {
    try {
      const claims = await db.collection("claims").find().sort({ created_at: -1 }).toArray();
      res.json(claims.map((c: any) => ({ 
        ...c, 
        id: c._id.toString(),
        has_customer_updates: c.has_customer_updates || false,
        agent_id: c.agent_id || ''
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/claims/:id", async (req, res) => {
    const { id } = req.params;
    try {
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
      const claim = await db.collection("claims").findOne({ _id: new ObjectId(id) });
      if (!claim) return res.status(404).json({ error: "Claim not found" });
      res.json({ ...claim, id: claim._id.toString() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/claims", async (req, res) => {
    const claimData = {
      ...req.body,
      status: req.body.status || 'חדש',
      claim_value: Number(req.body.claim_value) || 0,
      garage_settlement: req.body.garage_settlement ? 1 : 0,
      appraiser_chosen: req.body.appraiser_chosen ? 1 : 0,
      has_lien: req.body.has_lien ? 1 : 0,
      keys_handed_over: req.body.keys_handed_over ? 1 : 0,
      created_at: new Date(),
      last_activity_at: new Date()
    };

    try {
      const result = await db.collection("claims").insertOne(claimData);
      res.json({ id: result.insertedId.toString() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/claims/:id", async (req, res) => {
    const { id } = req.params;
    const incomingLastActivity = req.body.last_activity_at;
    
    const updateData = {
      ...req.body,
      claim_value: Number(req.body.claim_value) || 0,
      garage_settlement: req.body.garage_settlement ? 1 : 0,
      appraiser_chosen: req.body.appraiser_chosen ? 1 : 0,
      has_lien: req.body.has_lien ? 1 : 0,
      keys_handed_over: req.body.keys_handed_over ? 1 : 0,
      last_activity_at: new Date() // Update activity on every save
    };
    delete updateData.id;
    delete updateData._id;

    try {
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
      
      const currentClaim = await db.collection("claims").findOne({ _id: new ObjectId(id) });
      if (!currentClaim) return res.status(404).json({ error: "Claim not found" });

      // Optimistic Locking: Check if customer updated while admin was editing
      if (incomingLastActivity && currentClaim.last_activity_at) {
        const dbTime = new Date(currentClaim.last_activity_at).getTime();
        const incomingTime = new Date(incomingLastActivity).getTime();
        
        // If DB is newer by more than 1 second (to allow for small clock drifts)
        if (dbTime > incomingTime + 1000) {
          console.warn(`Conflict detected for claim ${id}. DB: ${dbTime}, Incoming: ${incomingTime}`);
          return res.status(409).json({ 
            error: "התביעה עודכנה על ידי הלקוח בזמן שערכת אותה. אנא סגור את החלון ופתח שוב כדי לראות את העדכונים החדשים.",
            db_last_activity: currentClaim.last_activity_at
          });
        }
      }

      await db.collection("claims").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/claims/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.collection("claims").deleteOne({ _id: new ObjectId(id) });
      // Also delete related logs and questionnaires
      await db.collection("claim_logs").deleteMany({ claim_id: id });
      await db.collection("questionnaires").deleteMany({ claim_id: id });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Claim Logs
  app.get("/api/claims/:id/logs", async (req, res) => {
    const { id } = req.params;
    try {
      const logs = await db.collection("claim_logs").find({ claim_id: id }).sort({ created_at: -1 }).toArray();
      res.json(logs.map((l: any) => ({ ...l, id: l._id.toString() })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/claims/:id/logs", async (req, res) => {
    const { id } = req.params;
    const { username, content } = req.body;
    try {
      const now = new Date();
      await db.collection("claim_logs").insertOne({
        claim_id: id,
        username,
        content,
        created_at: now
      });
      
      // Update last_activity_at in the claim
      await db.collection("claims").updateOne(
        { _id: new ObjectId(id) },
        { $set: { last_activity_at: now } }
      );
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/claims/:id/clear-updates", async (req, res) => {
    const { id } = req.params;
    try {
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
      await db.collection("claims").updateOne(
        { _id: new ObjectId(id) },
        { $set: { has_customer_updates: false, customer_updated_docs: [] } }
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Data Extraction using Gemini
  app.post("/api/claims/:id/extract-data", async (req, res) => {
    const { id } = req.params;
    const { field, filePath } = req.body;

    try {
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
      
      const absolutePath = path.join(__dirname, filePath.startsWith('/') ? filePath.slice(1) : filePath);
      if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      const fileBuffer = fs.readFileSync(absolutePath);
      const base64Data = fileBuffer.toString('base64');
      const mimeType = filePath.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';

      let prompt = "";
      let schema: any = {};

      if (field === 'appraiser_report_path') {
        prompt = "Extract the following values from this appraiser report: Damage Amount (גובה הנזק) and Depreciation (ירידת ערך). Return 0 if not found.";
        schema = {
          type: Type.OBJECT,
          properties: {
            damage_amount: { type: Type.NUMBER },
            depreciation_amount: { type: Type.NUMBER }
          },
          required: ["damage_amount", "depreciation_amount"]
        };
      } else if (field === 'appraiser_invoice_path') {
        prompt = "Extract the Appraiser Fee (שכר טרחת שמאי) including VAT from this invoice/receipt.";
        schema = {
          type: Type.OBJECT,
          properties: {
            appraiser_fee: { type: Type.NUMBER }
          },
          required: ["appraiser_fee"]
        };
      } else if (field === 'garage_invoice_path') {
        prompt = "Extract the Total Repair Amount (סכום תיקון) including VAT from this garage invoice.";
        schema = {
          type: Type.OBJECT,
          properties: {
            repair_amount: { type: Type.NUMBER }
          },
          required: ["repair_amount"]
        };
      } else {
        return res.status(400).json({ error: "Unsupported field for extraction" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      // Update claim with extracted data
      await db.collection("claims").updateOne(
        { _id: new ObjectId(id) },
        { $set: result }
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Extraction error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Demand Letter Generation
  // Claim Submission Route
  app.post("/api/claims/:id/submit-claim", async (req, res) => {
    const { id } = req.params;
    const { username, body, attachments, to: customTo } = req.body;

    try {
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });
      const claim = await db.collection("claims").findOne({ _id: new ObjectId(id) });
      if (!claim) return res.status(404).json({ error: "Claim not found" });

      // Find TP Insurance email
      const tpInsurance = await db.collection("entities").findOne({ _id: ObjectId.isValid(claim.tp_insurance_id) ? new ObjectId(claim.tp_insurance_id) : null });
      const to = customTo || tpInsurance?.email || claim.insurance_company_email;

      if (!to) {
        return res.status(400).json({ error: "לא נמצא מייל עבור חברת הביטוח הנתבעת" });
      }

      // Find user email for BCC (the agent handling the case)
      const agent = await db.collection("agents").findOne({ _id: ObjectId.isValid(claim.agent_id) ? new ObjectId(claim.agent_id) : null });
      const bcc = agent?.email;

      const transporter = await getTransporter();
      const eventDate = claim.event_date ? new Date(claim.event_date).toLocaleDateString('he-IL') : '';
      const subject = `מספר תביעה : ${claim.claim_number || ''} תאריך אירוע : ${eventDate}`;

      const mailAttachments = await Promise.all((attachments || []).map(async (att: {path: string, name: string}) => {
        const filePath = att.path;
        const filename = path.basename(filePath);
        const localPath = path.join(uploadsDir, filename);
        
        // 1. Try disk
        if (fs.existsSync(localPath)) {
          return {
            filename: att.name || filename,
            path: localPath,
          };
        }
        
        // 2. Try MongoDB fallback
        if (db) {
          const file = await db.collection("files").findOne({ filename });
          if (file && file.data) {
            return {
              filename: att.name || filename,
              content: file.data.buffer,
              contentType: file.mimeType
            };
          }
        }
        
        return null;
      }));

      const filteredAttachments = mailAttachments.filter(Boolean);

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@claims-app.com",
        to,
        bcc,
        subject,
        text: body,
        attachments: filteredAttachments,
      });

      await db.collection("claim_logs").insertOne({
        claim_id: id,
        username,
        content: `התביעה הוגשה לחברת הביטוח ${tpInsurance?.name || claim.insurance_company} עם ${filteredAttachments.length} קבצים`,
        created_at: new Date()
      });

      // Update claim status to 'בטיפול' and set submission date
      await db.collection("claims").updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'בטיפול', submission_date: new Date() } }
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Submit claim error:", error);
      res.status(500).json({ error: error.message });
    }
  });


  // Entities Management
  app.get("/api/entities", async (req, res) => {
    try {
      const entities = await db.collection("entities").find().sort({ name: 1 }).toArray();
      res.json(entities.map((e: any) => ({ ...e, id: e._id.toString() })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/entities", async (req, res) => {
    const { type, name, phone, email } = req.body;
    try {
      const result = await db.collection("entities").insertOne({
        type, name, phone, email,
        created_at: new Date()
      });
      res.json({ id: result.insertedId.toString() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/entities/:id", async (req, res) => {
    const { id } = req.params;
    const { type, name, phone, email } = req.body;
    try {
      await db.collection("entities").updateOne(
        { _id: new ObjectId(id) },
        { $set: { type, name, phone, email } }
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/entities/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.collection("entities").deleteOne({ _id: new ObjectId(id) });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Claim Handlers Management
  app.get("/api/claim-handlers", async (req, res) => {
    try {
      const handlers = await db.collection("claim_handlers").find().sort({ name: 1 }).toArray();
      res.json(handlers.map((h: any) => ({ ...h, id: h._id.toString() })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/claim-handlers", async (req, res) => {
    const { insurance_company, name, email, phone } = req.body;
    try {
      const result = await db.collection("claim_handlers").insertOne({
        insurance_company, name, email, phone,
        created_at: new Date()
      });
      res.json({ id: result.insertedId.toString() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/claim-handlers/:id", async (req, res) => {
    const { id } = req.params;
    const { insurance_company, name, email, phone } = req.body;
    try {
      await db.collection("claim_handlers").updateOne(
        { _id: new ObjectId(id) },
        { $set: { insurance_company, name, email, phone } }
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/claim-handlers/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.collection("claim_handlers").deleteOne({ _id: new ObjectId(id) });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Questionnaire Routes
  app.post("/api/claims/:id/questionnaire", async (req, res) => {
    const { id } = req.params;
    const qId = nanoid();
    
    try {
      await db.collection("questionnaires").insertOne({
        id: qId,
        claim_id: id,
        status: 'pending',
        created_at: new Date()
      });
      
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      const link = `${appUrl}/q/${qId}`;
      
      res.json({ link, id: qId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/questionnaires/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const q = await db.collection("questionnaires").findOne({ id });
      if (!q) return res.status(404).json({ error: "Questionnaire not found" });
      
      const claim = await db.collection("claims").findOne({ _id: new ObjectId(q.claim_id) });
      res.json({ questionnaire: q, claim: claim ? { ...claim, id: claim._id.toString() } : null });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/questionnaires/:id/submit", async (req, res) => {
    const { id } = req.params;
    const { formData } = req.body;
    console.log(`Received questionnaire submission for ID: ${id}`);
    
    try {
      const q = await db.collection("questionnaires").findOne({ id });
      if (!q) return res.status(404).json({ error: "Questionnaire not found" });

      // Update questionnaire status and data
      await db.collection("questionnaires").updateOne(
        { id },
        { $set: { status: 'completed', data: JSON.stringify(formData) } }
      );

      // Generate PDF
      let pdfDoc;
      const templatePath = path.join(__dirname, 'shomera_form.pdf');
      
      if (fs.existsSync(templatePath)) {
        const existingPdfBytes = fs.readFileSync(templatePath);
        pdfDoc = await PDFDocument.load(existingPdfBytes);
      } else {
        console.warn("shomera_form.pdf not found, creating a new PDF instead.");
        pdfDoc = await PDFDocument.create();
      }
      
      if (fontkit) {
        // Some versions of @pdf-lib/fontkit export the fontkit object as default or as the module itself
        const fk = (fontkit as any).default || fontkit;
        pdfDoc.registerFontkit(fk);
      }
      
      // Load Fonts Locally
      const fontPath = path.join(fontsDir, 'Rubik-Regular.ttf');
      const boldFontPath = path.join(fontsDir, 'Rubik-Bold.ttf');
      
      let font, boldFont;
      
      try {
        if (fs.existsSync(fontPath) && fs.existsSync(boldFontPath)) {
          const fontBytes = fs.readFileSync(fontPath);
          const boldFontBytes = fs.readFileSync(boldFontPath);
          
          if (fontBytes.length > 1000 && boldFontBytes.length > 1000) {
            font = await pdfDoc.embedFont(fontBytes);
            boldFont = await pdfDoc.embedFont(boldFontBytes);
          }
        }
      } catch (e: any) {
        console.error("Error embedding custom fonts:", e.message);
      }

      if (!font || !boldFont) {
        font = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
        boldFont = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);
      }
      
      const pages = pdfDoc.getPages();
      const page = pages[0] || pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      const isHebrew = (text: string) => /[\u0590-\u05FF]/.test(text);
      const reverseHebrew = (text: string) => {
        if (!text) return '';
        if (!isHebrew(text)) return text;
        
        // Basic RTL handling: reverse Hebrew segments but keep numbers/English LTR
        return text.split(/(\d+)/).map(part => {
          if (/^\d+$/.test(part)) return part;
          return part.split('').reverse().join('');
        }).reverse().join('');
      };

      const drawTextAt = (text: string, x: number, y: number, size = 10, isBold = false) => {
        if (!text) return;
        const rev = reverseHebrew(text);
        const useFont = isBold ? boldFont : font;
        page.drawText(rev, {
          x: x - useFont.widthOfTextAtSize(rev, size),
          y,
          size,
          font: useFont,
          color: rgb(0, 0, 0),
        });
      };

      // Map fields to Shomera form coordinates (approximate based on form layout)
      // Page 1
      drawTextAt(formData.insured_name, 540, 745, 11, true);
      drawTextAt(formData.insured_id, 380, 745, 11);
      
      drawTextAt(formData.insured_phone, 540, 715, 11);
      drawTextAt(formData.insured_email, 280, 715, 10);
      
      drawTextAt(formData.car_number, 540, 655, 12, true);
      drawTextAt(formData.car_model, 380, 655, 11);
      
      drawTextAt(formData.event_date, 540, 585, 11);
      drawTextAt(formData.event_time, 430, 585, 11);
      drawTextAt(formData.event_location, 320, 585, 10);
      
      drawTextAt(formData.damage_location, 540, 525, 11);
      
      // Description - multiline
      if (formData.event_description) {
        const descLines = formData.event_description.match(/.{1,60}/g) || [];
        descLines.slice(0, 4).forEach((line, idx) => {
          drawTextAt(line, 540, 480 - (idx * 15), 10);
        });
      }

      if (formData.has_third_party) {
        drawTextAt(formData.tp_name, 540, 380, 11);
        drawTextAt(formData.tp_phone, 380, 380, 11);
        drawTextAt(formData.tp_car_number, 540, 350, 11);
        drawTextAt(formData.tp_damage_location, 380, 350, 11);
      }

      const pdfBytes = await pdfDoc.save();
      const filename = `shomera_form_${q.claim_id}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, pdfBytes);

      // Update claim with the new PDF path
      await db.collection("claims").updateOne(
        { _id: new ObjectId(q.claim_id) },
        { $set: { claim_form_path: `/uploads/${filename}` } }
      );

      // Add log
      await db.collection("claim_logs").insertOne({
        claim_id: q.claim_id,
        username: 'System',
        content: 'הלקוח מילא את שאלון שומרה. הטופס הופק וצורף לתביעה.',
        created_at: new Date()
      });

      // Send email to admin
      try {
        const adminEmail = "uv.levari@gmail.com";
        const transporter = await getTransporter();
        
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@claims-app.com",
          to: adminEmail,
          subject: `שאלון שומרה חדש - ${formData.insured_name} - רכב ${formData.car_number}`,
          text: `התקבל שאלון שומרה חדש עבור הלקוח ${formData.insured_name}.\nמצורף הטופס המלא.`,
          attachments: [
            {
              filename: `shomera_${formData.car_number}.pdf`,
              path: filePath
            }
          ]
        });
        
        console.log(`Email sent to ${adminEmail}`);
      } catch (emailError) {
        console.error("Error sending notification email:", emailError);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error submitting questionnaire:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Helper to get email transporter
  async function getTransporter() {
    if (!process.env.SMTP_USER) {
      console.log("No SMTP credentials found. Using Ethereal Email for testing...");
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      const isGmail = process.env.SMTP_HOST?.includes('gmail.com');
      if (isGmail) {
        return nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        return nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      }
    }
  }

  // Email Sending
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, body, claimId, username, attachments } = req.body;
    
    try {
      const transporter = await getTransporter();
      const { attachmentNames } = req.body;

      // Find user email for BCC
      const user = await db.collection("users").findOne({ username });
      const bcc = user?.email;

      const mailAttachments = (attachments || []).map((filePath: string, index: number) => {
        const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        const absolutePath = path.join(__dirname, relativePath);
        if (fs.existsSync(absolutePath)) {
          return {
            filename: attachmentNames && attachmentNames[index] 
              ? `${attachmentNames[index]}${path.extname(filePath)}` 
              : path.basename(filePath),
            path: absolutePath,
          };
        }
        return null;
      }).filter(Boolean);

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@claims-app.com",
        to,
        bcc,
        subject,
        text: body,
        attachments: mailAttachments,
      });

      if (!process.env.SMTP_USER) {
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }

      const attachmentCount = mailAttachments.length;
      const logContent = `נשלח מייל אל ${to}: ${subject} (${attachmentCount} קבצים מצורפים)${!process.env.SMTP_USER ? ' [Ethereal Test Mail]' : ''}`;
      
      await db.collection("claim_logs").insertOne({
        claim_id: claimId,
        username,
        content: logContent,
        created_at: new Date()
      });

      res.json({ success: true, previewUrl: !process.env.SMTP_USER ? nodemailer.getTestMessageUrl(info) : null });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Agents Management
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await db.collection("agents").find().sort({ name: 1 }).toArray();
      res.json(agents.map((a: any) => ({ ...a, id: a._id.toString() })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/agents", async (req, res) => {
    const { name, phone, email } = req.body;
    try {
      const result = await db.collection("agents").insertOne({
        name, phone, email,
        created_at: new Date()
      });
      res.json({ id: result.insertedId.toString() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/agents/:id", async (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    try {
      await db.collection("agents").updateOne(
        { _id: new ObjectId(id) },
        { $set: { name, phone, email } }
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/agents/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.collection("agents").deleteOne({ _id: new ObjectId(id) });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Global error handler for API routes
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("API Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "שגיאת שרת פנימית",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });

  // Catch-all for undefined API routes to prevent falling through to Vite/SPA fallback
  app.all("/api*", (req, res) => {
    console.warn(`[API Catch-all] Unmatched API route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // SPA Fallback for public routes
  app.get(["/status/:id", "/q/:id"], (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    } else {
      next();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      if (req.originalUrl.startsWith("/api")) {
        console.warn(`[SPA Fallback] API request hit SPA fallback: ${req.originalUrl}`);
        return res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
      }
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
});
