import type { Metadata } from "next";
import { getCategories } from "@/lib/queries/categories";
import { createCategory, deleteCategory, toggleCategoryNav } from "@/lib/actions/categories";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = {
  title: "Admin — Categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest">Categories</h1>
      </div>

      {/* Liste */}
      <div className="border border-black mb-10">
        <div className="grid grid-cols-12 px-4 py-3 border-b border-black bg-black text-white text-xs font-bold uppercase tracking-widest">
          <span className="col-span-4">Nom</span>
          <span className="col-span-3">Slug</span>
          <span className="col-span-2 text-center">Nav</span>
          <span className="col-span-1 text-center">Ordre</span>
          <span className="col-span-2 text-right">Action</span>
        </div>

        {categories.length === 0 ? (
          <div className="py-10 text-center text-xs text-black/40 uppercase tracking-widest">
            Aucune catégorie
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="grid grid-cols-12 px-4 py-4 border-b border-black last:border-b-0 items-center">
              <span className="col-span-4 text-xs font-bold uppercase tracking-widest">{cat.name}</span>
              <span className="col-span-3 text-xs font-mono text-black/40">{cat.slug}</span>

              {/* Toggle nav */}
              <div className="col-span-2 flex justify-center">
                <form action={async () => { "use server"; await toggleCategoryNav(cat.id, cat.show_in_nav); }}>
                  <button
                    type="submit"
                    className="text-xs font-bold uppercase tracking-widest px-2 py-1 border transition-colors"
                    style={cat.show_in_nav
                      ? { background: "#000", color: "#fff", borderColor: "#000" }
                      : { background: "#fff", color: "#000", borderColor: "#000" }}
                  >
                    {cat.show_in_nav ? "Oui" : "Non"}
                  </button>
                </form>
              </div>

              <span className="col-span-1 text-xs text-center text-black/40">{cat.sort_order}</span>

              {/* Delete */}
              <div className="col-span-2 flex justify-end">
                <DeleteButton
                  action={async () => { "use server"; await deleteCategory(cat.id); }}
                  label="Supprimer"
                  confirmMessage={`Supprimer la catégorie "${cat.name}" ?`}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulaire création */}
      <div className="border border-black p-6">
        <h2 className="text-sm font-black uppercase tracking-widest mb-6">Nouvelle catégorie</h2>
        <form
          action={async (fd) => {
            "use server";
            await createCategory(fd);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest">Nom</label>
              <input
                name="name"
                required
                placeholder="Vêtements"
                className="px-4 py-3 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest">Slug</label>
              <input
                name="slug"
                required
                placeholder="vetements"
                className="px-4 py-3 border border-black text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest">Ordre dans le nav</label>
              <input
                name="sort_order"
                type="number"
                defaultValue={0}
                min={0}
                className="px-4 py-3 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="show_in_nav"
                  defaultChecked
                  className="w-4 h-4 border border-black appearance-none checked:bg-black cursor-pointer"
                />
                <span className="text-xs font-bold uppercase tracking-widest">Afficher dans le nav</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:!text-black border border-black transition-colors"
          >
            Créer la catégorie
          </button>
        </form>
      </div>
    </div>
  );
}
