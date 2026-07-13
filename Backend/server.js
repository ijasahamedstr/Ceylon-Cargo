import express from "express";
import connectDB from "./lib/db.js";
import { config } from "./config/env.js";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Route Imports
import Adminrouter from "./routes/AccountRegisterAdmin.route.js";
import Bookingrouter from "./routes/Booking.route.js";
import MoveGrouprouter from "./routes/MoveGroup.route.js";
import SalesPersonrouter from "./routes/SalesPerson.route.js";
import { protectAndAuthorize } from "./lib/authMiddleware.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 3. CORS setup
app.use(cors({
  origin: config.corsOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

app.use(express.json());
// Serve the uploads folder statically so you can view images via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

 
// 5. Connect Database
connectDB();

// 6. Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use('/api', protectAndAuthorize, Adminrouter);
app.use("/api/bookings", protectAndAuthorize, Bookingrouter);
app.use("/api/move-groups", protectAndAuthorize, MoveGrouprouter);
app.use("/api/sales-persons", protectAndAuthorize, SalesPersonrouter);

// 7. Start server
const port = config.port;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
