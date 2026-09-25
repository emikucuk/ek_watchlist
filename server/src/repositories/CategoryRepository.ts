import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../errors/AppError.js";

export class CategoryRepository {
  list() {
    return prisma.customCategory.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { name: "asc" },
    });
  }

  async create(data: { name: string; color?: string; icon?: string | null }) {
    return prisma.customCategory.create({
      data: {
        name: data.name,
        color: data.color ?? "#6366f1",
        icon: data.icon,
      },
    });
  }

  async update(
    id: string,
    data: { name?: string; color?: string; icon?: string | null }
  ) {
    await this.ensureExists(id);
    return prisma.customCategory.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.ensureExists(id);
    await prisma.customCategory.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const category = await prisma.customCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundError("Category not found");
    }
  }
}

export const categoryRepository = new CategoryRepository();
