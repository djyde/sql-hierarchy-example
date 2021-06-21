import { PrismaClient } from "@prisma/client";
import { NodeService, NodeType, RootService } from "..";

export async function initial(prisma: PrismaClient) {

  const nodeService = new NodeService(prisma);

  // create a root
  const root = await prisma.root.create({
    data: {},
  });

  /**
   * - A
   *  - B
   *  - C
   * - D
   * - E
   */

  // create a node
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

}