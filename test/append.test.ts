import { PrismaClient } from "@prisma/client";
import { NodeService, NodeType, RootService } from "../index";

describe("append", () => {
  let prisma = new PrismaClient();
  const nodeService = new NodeService(prisma);

  beforeAll(async () => {});

  afterAll(async () => {
    prisma.$disconnect();
  });

  test("append to no-child node", async () => {
    const root = await prisma.root.create({
      data: {},
    });

    const tree = new RootService(prisma, root.id);

    const A = await prisma.node.create({
      data: {
        rootId: root.id,
        title: "A",
        parentId: null,
        type: NodeType.Title,
        preItemId: null,
      },
    });

    const B = await prisma.node.create({
      data: {
        rootId: root.id,
        parentId: A.id,
        title: "B",
        type: NodeType.Title,
        preItemId: null,
      },
    });

    const C = await prisma.node.create({
      data: {
        rootId: root.id,
        parentId: A.id,
        title: "C",
        type: NodeType.Title,
        preItemId: B.id,
      },
    });

    const D = await prisma.node.create({
      data: {
        rootId: root.id,
        parentId: null,
        title: "D",
        type: NodeType.Title,
        preItemId: A.id,
      },
    });

    const E = await prisma.node.create({
      data: {
        rootId: root.id,
        parentId: null,
        title: "E",
        type: NodeType.Title,
        preItemId: D.id,
      },
    });

    let t = await tree.serialize();

    expect(t).toMatchObject([
      {
        title: "A",
        children: [
          {
            title: "B",
          },
          {
            title: "C",
          },
        ],
      },
      {
        title: "D",
      },
      {
        title: "E",
      },
    ]);

    await nodeService.append(E.id, C.id);
    t = await tree.serialize();

    expect(t).toMatchObject([
      {
        title: "A",
        children: [
          {
            title: "B",
          },
          {
            title: "C",
            children: [
              {
                title: "E",
              },
            ],
          },
        ],
      },
      {
        title: "D",
      },
    ]);
  });

  test("append to has-children node", async () => {
    const root = await prisma.root.create({
      data: {},
    });

    const tree = new RootService(prisma, root.id);

    const A = await prisma.node.create({
      data: {
        rootId: root.id,
        title: "A",
        parentId: null,
        type: NodeType.Title,
        preItemId: null,
      },
    });

    const B = await prisma.node.create({
      data: {
        rootId: root.id,
        parentId: A.id,
        title: "B",
        type: NodeType.Title,
        preItemId: null,
      },
    });

    const C = await prisma.node.create({
      data: {
        rootId: root.id,
        parentId: A.id,
        title: "C",
        type: NodeType.Title,
        preItemId: B.id,
      },
    });

    const D = await prisma.node.create({
      data: {
        rootId: root.id,
        parentId: null,
        title: "D",
        type: NodeType.Title,
        preItemId: A.id,
      },
    });

    const E = await prisma.node.create({
      data: {
        rootId: root.id,
        parentId: null,
        title: "E",
        type: NodeType.Title,
        preItemId: D.id,
      },
    });

    let t = await tree.serialize();

    expect(t).toMatchObject([
      {
        title: "A",
        children: [
          {
            title: "B",
          },
          {
            title: "C",
          },
        ],
      },
      {
        title: "D",
      },
      {
        title: "E",
      },
    ]);

    await nodeService.append(E.id, A.id);
    t = await tree.serialize();

    expect(t).toMatchObject([
      {
        title: "A",
        children: [
          {
            title: "E",
          },
          {
            title: "B",
          },
          {
            title: "C",
          },
        ],
      },
      {
        title: "D",
      },
    ]);
  });
});
