import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import productRoutes from "./routes/product.routes.js";
import warehouseRoutes from "./routes/warehouse.routes.js";
import locationRoutes from "./routes/location.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import movementRoutes from "./routes/movement.routes.js";
import orderRoutes from "./routes/order.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ success: true, message: "logi-ject API funcionando!", database: "connected", timestamp: new Date().toISOString() });
  } catch {
    return res.status(503).json({ success: false, message: "API funcionando, mas banco indisponível.", database: "disconnected" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/movements", movementRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/reports", reportRoutes);
app.use(errorHandler);

app.listen(env.port, () => console.log(`🚀 logi-ject API rodando em http://localhost:${env.port}`));
