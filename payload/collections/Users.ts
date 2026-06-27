import type { CollectionConfig } from "payload";

// Tek yetkili: yalnız 'admin' rolü her şeyi yapar.
const isAdmin = ({ req }: { req: { user?: { role?: string | null } | null } }) =>
  req.user?.role === "admin";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email"
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    // Yönetim paneline yalnız admin rolü girebilir.
    admin: isAdmin,
  },
  hooks: {
    beforeValidate: [
      // TEK HESAP POLİTİKASI (sahibi tek tam-yetkili admin):
      //  - İlk (ve tek) kullanıcı her zaman 'admin' rolüyle oluşturulur.
      //  - Kullanıcı zaten varsa ikinci/başka hesap oluşturmak ENGELLENİR.
      async ({ req, operation, data }) => {
        if (operation !== "create") return data;
        const existing = await req.payload.count({
          collection: "users",
          overrideAccess: true,
        });
        if (existing.totalDocs > 0) {
          throw new Error(
            "Tek yönetici hesabı politikası: ek kullanıcı oluşturulamaz."
          );
        }
        return { ...data, role: "admin" };
      },
    ],
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      // İlk kullanıcı hook ile zaten admin yapılır; default da admin.
      defaultValue: "admin",
      // Rolü yalnız admin değiştirebilir (kendini editöre düşürme/yükseltme kontrolü).
      access: {
        update: isAdmin,
      },
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" }
      ]
    },
    {
      name: "name",
      type: "text"
    }
  ]
};
