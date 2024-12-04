const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../../models/Users");
const bcrypt = require("bcryptjs");
const CLIENT_ID =
  "798950239493-0pm1ujc3r89kknh30kr2rilsnmqbbhrg.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
const crypto = require("crypto");

// Функция для генерации access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, isAdmin: user.isAdmin, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

function generatePassword(length) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    console.error("Credential token is missing.");
    return res.status(400).json({ message: "Credential token is missing" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential.credential.toString(), // Передаем только строку токена
      audience: CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();
    const password = generatePassword(12);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Найдите пользователя в базе данных или создайте нового
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: hashedPassword,
        isGoogleUser: true,
      });
      await user.save();
    }

    // Создаем JWT для аутентификации
    const accessToken = generateAccessToken(user);
    return res.json({ accessToken });
  } catch (error) {
    console.error("Ошибка при Google аутентификации:", error.message);
    return res.status(401).json({ message: "Invalid Google token" });
  }
};

module.exports = googleLogin;
