import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /api/track
 * Get all documents
 * @returns {Promise<JSON>} documents
 */
router.get("/", async (_req, res) => {
  const tracks = await prisma.document.findMany({
    include: {
      status: true,
    },
  });
  res.json(tracks);
});

/**
 * GET /api/track/:id
 * Get a document by id
 * @returns {Promise<JSON>} document
 */
router.get("/:id", async (req, res) => {
  const track = await prisma.document.findUnique({
    where: { id: String(req.params.id) },
    include: {
      status: true,
    },
  });
  res.json(track);
});

/**
 * POST /api/track/create
 * Create a new document
 * @returns {Promise<JSON>} document
 * @param {string} name - name of document
 * @param {string} type - type of document
 * @param {string} submittedDate - date document was submitted
 * @param {string?} completionDate - date document was completed
 * @param {string} status - status of document
 */
router.post("/create", async (req, res) => {
  const { name, type, submittedDate, completionDate, description } = req.body;
  const date = new Date();

  try {
    const newDocument = await prisma.document.create({
      data: {
        name,
        type,
        submittedDate: submittedDate || date,
        completionDate,
        status: {
          create: {
            name: "Submitted",
            description: description,
            date,
          },
        },
      },
      include: { status: true },
    });
    res.redirect(`http://localhost:3000/tracking#${name}`);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "An error occurred while creating the document" });
  }
});

/**
 * POST /api/track/status
 * Update a document's status
 * @returns {Promise<JSON>} document
 * @param {string} id - document id
 * @param {string} status - status of document
 */
router.post("/status", async (req, res) => {
  console.log(req.body);
  const { id, status, description } = req.body;
  await prisma.document.update({
    where: { id: String(id) },
    data: {
      status: {
        create: {
          name: status,
          description,
          date: new Date(),
        },
      },
    },
  });
  res.redirect(`http://localhost:3000/tracking`);
});

/**
 * DELETE /api/track/delete
 * Delete all documents
 * @returns {Promise<JSON>} deleted
 */
router.delete("/delete", async (_req, res) => {
  const status = await prisma.status.deleteMany();
  const deleted = await prisma.document.deleteMany();
  res.json({ deleted, status });
});

export default router;
