import { Node, PrismaClient } from "@prisma/client";

export class RootService {
  constructor(private prisma: PrismaClient, private rootId: string) {}

  async serialize(options?: { parentId?: string }) {
    let left = await this.prisma.node.findFirst({
      where: {
        rootId: this.rootId,
        preItemId: null,
        parentId: options?.parentId || null,
      },
      select: {
        preItemId: true,
        id: true,
        nextItem: true,
        title: true,
      },
    });

    const items = [] as any[];

    const r = async () => {
      const joinChildren = async (
        node: Pick<Node, "id" | "title"> & {
          nextItem: Node;
        }
      ) => {
        // @ts-expect-error
        node.children = await this.serialize({
          parentId: node.id,
        });
        return node;
      };

      if (left) {
        items.push(await joinChildren(left as any));
      }
    };

    await r();

    while (left?.nextItem) {
      left = await this.prisma.node.findFirst({
        where: {
          rootId: this.rootId,
          preItemId: left.id,
          parentId: options?.parentId || null,
        },
        select: {
          preItemId: true,
          id: true,
          nextItem: true,
          title: true,
        },
      });

      await r();
    }

    return items;
  }
}

export class NodeService {
  constructor(private prisma: PrismaClient) {}

  async remove(nodeId: string) {
    // TODO: prevent remove node that has children
    const node = await this.prisma.node.findUnique({
      where: {
        id: nodeId,
      },
      select: {
        preItem: {
          select: {
            id: true,
          },
        },
        nextItem: {
          select: {
            id: true,
          },
        },
      },
    });

    await this.prisma.$transaction(
      [
        this.prisma.node.update({
          where: {
            id: nodeId,
          },
          data: {
            parentId: null,
            preItemId: null,
          },
        }),

        node!.nextItem
          ? this.prisma.node.update({
              where: {
                id: node!.nextItem?.id,
              },
              data: {
                preItemId: node!.preItem?.id,
              },
            })
          : null,

        this.prisma.node.delete({
          where: {
            id: nodeId,
          },
        }),
      ].filter(Boolean) as any
    );
  }

  async insertBefore(nodeId: string, targetNodeId: string) {
    const [node, targetNode] = await this.prisma.$transaction([
      this.prisma.node.findUnique({
        where: {
          id: nodeId,
        },
        select: {
          preItemId: true,
          nextItem: {
            select: {
              id: true,
              parentId: true,
              preItemId: true,
            },
          },
        },
      }),
      this.prisma.node.findUnique({
        where: {
          id: targetNodeId,
        },
        select: {
          preItemId: true,
          parentId: true,
          nextItem: {
            select: {
              id: true,
              parentId: true,
              preItemId: true,
            },
          },
        },
      }),
    ]);

    const updated = await this.prisma.$transaction(
      [
        this.prisma.node.update({
          where: {
            id: targetNodeId,
          },
          data: {
            preItem: {
              connect: {
                id: nodeId,
              },
            },
          },
          select: {
            title: true,
            preItem: true,
            parent: true,
            nextItem: true,
          },
        }),
        this.prisma.node.update({
          where: {
            id: nodeId,
          },
          data: {
            preItemId: targetNode!.preItemId,
            parentId: targetNode!.parentId,
          },
          select: {
            title: true,
            preItem: true,
            parent: true,
            nextItem: true,
          },
        }),
        node?.nextItem
          ? this.prisma.node.update({
              where: {
                id: node?.nextItem?.id,
              },
              data: {
                preItemId: node?.preItemId,
              },
            })
          : null,
      ].filter(Boolean) as any
    );
  }

  async append(nodeId: string, targetNodeId: string) {
    const [node, targetNode, firstChild] = await this.prisma.$transaction([
      this.prisma.node.findUnique({
        where: {
          id: nodeId,
        },
        select: {
          preItemId: true,
          nextItem: {
            select: {
              id: true,
              parentId: true,
              preItemId: true,
            },
          },
        },
      }),
      this.prisma.node.findUnique({
        where: {
          id: targetNodeId,
        },
        select: {
          preItemId: true,
          parentId: true,
          nextItem: {
            select: {
              id: true,
              parentId: true,
              preItemId: true,
            },
          },
        },
      }),
      this.prisma.node.findFirst({
        where: {
          parentId: targetNodeId,
          preItemId: null,
        },
        select: {
          id: true,
        },
      }),
    ]);

    const operations = [] as any[];

    if (firstChild) {
      await this.insertBefore(nodeId, firstChild.id);
    } else {
      operations.push(
        this.prisma.node.update({
          where: {
            id: nodeId,
          },
          data: {
            parentId: targetNodeId,
            preItemId: null,
          },
        })
      );
    }

    if (node!.nextItem) {
      operations.push(
        this.prisma.node.update({
          where: {
            id: node!.nextItem.id,
          },
          data: {
            preItemId: node!.preItemId || null,
          },
        })
      );
    }

    await this.prisma.$transaction(operations);
  }
}

export enum NodeType {
  Title = "TITLE",
}
