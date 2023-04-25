import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (_req, res) => {
  const tracks = await prisma.document.findMany({
    include: {
      status: true,
    },
  });
  res.json(tracks);
});

router.get("/:id", async (req, res) => {
  const track = await prisma.document.findUnique({
    where: { id: String(req.params.id) },
    include: {
      status: true,
    },
  });
  res.json(track);
});

router.post("/create", async (req, res) => {
  const { name, type, submittedDate, completionDate, status } = req.body;
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
            name: status.name,
            description: status.description,
            date,
          },
        },
      },
      include: { status: true },
    });

    res.send(newDocument);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "An error occurred while creating the document" });
  }
});

router.post("/status", async (req, res) => {
  const { id, status } = req.body;
  const track = await prisma.document.update({
    where: { id: String(id) },
    data: {
      status: {
        create: {
          date: new Date(),
          ...status,
        },
      },
    },
  });
  res.json(track);
});

// Delete all documents, including their status
router.delete("/delete", async (_req, res) => {
  const status = await prisma.status.deleteMany();
  const deleted = await prisma.document.deleteMany();
  res.json({deleted, status});
});


export default router;
