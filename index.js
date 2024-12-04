require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());
const corsOptions = {
  origin: process.env.FRONT_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"], // Разрешаем эти методы
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Разрешаем заголовки
};
// Middlewares
app.use(express.json({ limit: "100mb" }));
const allowedOrigins = [
  "https://e-commerse-front-sigma.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Проверка, если запрос идет с разрешенного домена
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // если используете куки или авторизацию
    methods: ["GET", "POST", "PUT", "DELETE"], // Разрешаем эти методы
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Или ваш URL клиента
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
