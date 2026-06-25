import express from "express";
import connectDB from "./lib/db.js";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Route Imports
import Adminrouter from "./routes/AccountRegisterAdmin.route.js";
import Bookingrouter from "./routes/Booking.route.js";
import SalesPersonRouter from "./routes/salesPersonRoutes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 3. CORS setup
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
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

app.use('/api',Adminrouter);
app.use("/api/bookings", Bookingrouter);
app.use("/api/sales-persons", SalesPersonRouter);

// 7. Start server
const port = 8002;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});