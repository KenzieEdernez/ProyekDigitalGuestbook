import express from "express";
import bodyParser from "body-parser";
import multer from "multer";

const router = express.Router();
router.use(bodyParser.json());

// POST /api/checkin
router.post("/", async (req, res) => {
  const { barcode } = req.body;
  if (!barcode) return res.status(400).json({ error: "barcode diperlukan" });

  try {
    // TODO: ganti ini dengan logika DB Anda
    // contoh: cari entri/participant berdasarkan barcode
    const isValid = true; // logic Anda
    if (!isValid) return res.status(404).json({ error: "barcode tidak valid" });

    // contoh menghasilkan souvenir:
    const souvenir = {
      id: "sv-123",
      name: "Souvenir A",
      pickupCode: "PCK-456",
    };

    // tandai check-in di DB
    // await db.createCheckin({ barcode, time: new Date(), ... });

    return res.json({ message: "Check-in tercatat", souvenir });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

// Optional: upload image for server-side decode
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-scan", upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "file diperlukan" });

  // Implement server-side decoding using a library (e.g. @zxing/library via node-canvas, or calling an external service)
  // Untuk contoh singkat, return 501
  return res.status(501).json({ error: "Not implemented: server-side image scanning" });
});

export default router;
