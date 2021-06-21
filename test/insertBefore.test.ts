import { PrismaClient } from "@prisma/client";
import { NodeService, NodeType, RootService } from "../index";

describe("insertBefore", () => {
  let prisma = new PrismaClient();
  const nodeService = new NodeService(prisma);

  beforeAll(async () => {});

  afterAll(async () => {
    prisma.$disconnect();
  });

  test("insert before same level", async () => {
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

    await nodeService.insertBefore(E.id, D.id);
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
          },
        ],
      },
      {
        title: "E",
      },
      {
        title: "D",
      },
    ]);
  });

  test("insert before a node of a parent", async () => {
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

    await nodeService.insertBefore(E.id, C.id);
    t = await tree.serialize();

    expect(t).toMatchObject([
      {
        title: "A",
        children: [
          {
            title: "B",
          },
          {
            title: "E",
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

  test("insert before a head", async () => {
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

    await nodeService.insertBefore(E.id, A.id);
    t = await tree.serialize();

    expect(t).toMatchObject([
      {
        title: "E",
      },
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
    ]);
  });

  test("insert a parent before a node", async () => {
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

    await nodeService.insertBefore(A.id, E.id);
    t = await tree.serialize();

    expect(t).toMatchObject([
      {
        title: "D",
      },
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
        title: "E",
      },
    ]);
  });

  test("move a child node before another node", async () => {
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

    await nodeService.insertBefore(C.id, A.id);
    t = await tree.serialize();

    expect(t).toMatchObject([
      {
        title: "C",
      },
      {
        title: "A",
        children: [
          {
            title: "B",
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
  });
});
