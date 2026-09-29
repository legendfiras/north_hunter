"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { upload } from "@vercel/blob/client";
import type { Locale } from "@/i18n";
import type { Category, Product } from "@/content/products";
import { formatPrice } from "@/lib/price";

type CatalogResponse = {
  categories: Category[];
  products: Product[];
  imageCount: number;
  imageLimit: number;
  directUpload?: boolean;
  pathname?: string;
  path?: string;
  id?: string;
  error?: string;
};

const copy = {
  en: {
    title: "Dashboard",
    intro: "Add a product, choose a category, and upload one photo. The store can hold 30 photos.",
    photos: "Photos",
    addProduct: "Add a product",
    name: "Product name",
    price: "Price",
    category: "Category",
    photo: "Photo",
    choosePhoto: "Choose photo",
    noPhoto: "No photo selected",
    save: "Save product",
    saving: "Saving…",
    products: "Products",
    empty: "No products yet.",
    edit: "Edit",
    remove: "Delete",
    cancel: "Cancel",
    update: "Update",
    rename: "Rename",
    categories: "Categories",
    categoryName: "Category name",
    addCategory: "Add category",
    used: "Remove its products before deleting this category.",
    missing: "Fill in the name, price, category, and photo.",
    priceError: "Enter a price of zero or more.",
    type: "Use a JPG, PNG, or WebP photo.",
    size: "That photo is larger than 8 MB.",
    limit: "The store already has 30 photos.",
    categoryError: "Choose a category.",
    upload: "The photo could not be uploaded.",
    storage: "Storage is not configured, so this change was not saved.",
    saved: "Saved.",
  },
  ar: {
    title: "لوحة التحكم",
    intro: "أضف منتجًا، اختر القسم، وارفع صورة واحدة. يمكن حفظ 30 صورة.",
    photos: "الصور",
    addProduct: "إضافة منتج",
    name: "اسم المنتج",
    price: "السعر",
    category: "القسم",
    photo: "الصورة",
    choosePhoto: "اختيار صورة",
    noPhoto: "لم تُختر صورة",
    save: "حفظ المنتج",
    saving: "جارٍ الحفظ…",
    products: "المنتجات",
    empty: "لا توجد منتجات بعد.",
    edit: "تعديل",
    remove: "حذف",
    cancel: "إلغاء",
    update: "تحديث",
    rename: "تغيير الاسم",
    categories: "الأقسام",
    categoryName: "اسم القسم",
    addCategory: "إضافة قسم",
    used: "احذف منتجات هذا القسم قبل حذفه.",
    missing: "اكتب الاسم والسعر والقسم، ثم اختر صورة.",
    priceError: "اكتب سعرًا من صفر فما فوق.",
    type: "استخدم صورة JPG أو PNG أو WebP.",
    size: "حجم الصورة أكبر من 8 ميغابايت.",
    limit: "وصل المتجر إلى 30 صورة.",
    categoryError: "اختر قسمًا.",
    upload: "تعذّر رفع الصورة.",
    storage: "التخزين غير مهيأ، ولم يُحفظ هذا التغيير.",
    saved: "تم الحفظ.",
  },
} as const;

function PhotoField({
  name,
  required = false,
  label,
  button,
  empty,
}: {
  name: string;
  required?: boolean;
  label: string;
  button: string;
  empty: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  return (
    <div className="block text-sm text-charcoal">
      <span>{label}</span>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={required}
        className="sr-only"
        onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-1 inline-flex min-h-12 w-full items-center justify-center border border-forest bg-ivory px-4 text-sm font-semibold text-forest"
      >
        {button}
      </button>
      <p className="mt-2 min-h-5 text-sm text-moss" dir="ltr">
        {fileName || empty}
      </p>
    </div>
  );
}

function message(locale: Locale, error: string | undefined) {
  const text = copy[locale];
  if (error === "price") return text.priceError;
  if (error === "type") return text.type;
  if (error === "size") return text.size;
  if (error === "limit") return text.limit;
  if (error === "category") return text.categoryError;
  if (error === "used") return text.used;
  if (error === "missing") return text.missing;
  if (error === "upload") return text.upload;
  if (error === "storage") return text.storage;
  return "";
}

export function Dashboard({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [imageCount, setImageCount] = useState(0);
  const [imageLimit, setImageLimit] = useState(30);
  const [directUpload, setDirectUpload] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/catalog", { cache: "no-store" });
    if (response.status === 401) {
      window.location.assign("/admin");
      return;
    }
    const data = (await response.json()) as CatalogResponse;
    setCategories(data.categories);
    setProducts(data.products);
    setImageCount(data.imageCount);
    setImageLimit(data.imageLimit);
    setDirectUpload(data.directUpload === true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function uploadDirect(file: File, productId = "") {
    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: file.type, size: file.size, productId }),
    });
    const data = (await response.json()) as CatalogResponse;
    if (!response.ok || !data.pathname || !data.path) return { error: data.error || "upload" };
    try {
      await upload(data.pathname, file, { access: "public", handleUploadUrl: "/api/uploads" });
    } catch {
      return { error: "upload" };
    }
    return { path: data.path, id: data.id ?? "" };
  }

  function selectedFile(form: HTMLFormElement) {
    const input = form.elements.namedItem("image");
    if (!(input instanceof HTMLInputElement)) return null;
    return input.files?.[0] ?? null;
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const form = event.currentTarget;
    const body = new FormData(form);
    if (directUpload) {
      const file = selectedFile(form);
      body.delete("image");
      if (!file) {
        setBusy(false);
        setNotice(text.missing);
        return;
      }
      const stored = await uploadDirect(file);
      if ("error" in stored) {
        setBusy(false);
        setNotice(message(locale, stored.error));
        return;
      }
      body.set("imagePath", stored.path);
      if (stored.id) body.set("id", stored.id);
    }
    const response = await fetch("/api/products", { method: "POST", body });
    const data = (await response.json()) as CatalogResponse;
    setBusy(false);
    if (!response.ok) {
      setNotice(message(locale, data.error));
      return;
    }
    form.reset();
    setProducts(data.products);
    setImageCount((count) => count + 1);
    setNotice(text.saved);
  }

  async function updateProduct(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const form = event.currentTarget;
    const body = new FormData(form);
    if (directUpload) {
      const file = selectedFile(form);
      body.delete("image");
      if (file) {
        const stored = await uploadDirect(file, id);
        if ("error" in stored) {
          setBusy(false);
          setNotice(message(locale, stored.error));
          return;
        }
        body.set("imagePath", stored.path);
      }
    }
    const response = await fetch(`/api/products/${id}`, { method: "PATCH", body });
    const data = (await response.json()) as CatalogResponse;
    setBusy(false);
    if (!response.ok) {
      setNotice(message(locale, data.error));
      return;
    }
    setEditing(null);
    setProducts(data.products);
    setNotice(text.saved);
  }

  async function deleteProduct(id: string) {
    setBusy(true);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setBusy(false);
    setEditing(null);
    await load();
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name") ?? "");
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = (await response.json()) as CatalogResponse;
    if (!response.ok) {
      setNotice(message(locale, data.error));
      return;
    }
    form.reset();
    await load();
  }

  async function renameCategory(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    const response = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = (await response.json()) as CatalogResponse;
    if (!response.ok) {
      setNotice(message(locale, data.error));
      return;
    }
    setNotice(text.saved);
    await load();
  }

  async function deleteCategory(id: string) {
    const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = (await response.json()) as CatalogResponse;
    if (!response.ok) {
      setNotice(message(locale, data.error));
      return;
    }
    setNotice("");
    await load();
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold text-charcoal">{text.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-moss">{text.intro}</p>
        <p className="mt-4 text-sm font-semibold text-forest" dir="ltr">
          {text.photos}: {imageCount} / {imageLimit}
        </p>
        {notice ? <p className="mt-3 text-sm font-medium text-olive">{notice}</p> : null}
      </div>

      <section className="bg-paper p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-charcoal">{text.addProduct}</h2>
        <form onSubmit={submitProduct} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-charcoal">
            {text.name}
            <input name="name" required className="mt-1 min-h-11 w-full border border-line bg-ivory px-3" />
          </label>
          <label className="block text-sm text-charcoal">
            {text.price}
            <input name="price" type="number" min="0" step="1" required dir="ltr" className="mt-1 min-h-11 w-full border border-line bg-ivory px-3" />
          </label>
          <label className="block text-sm text-charcoal">
            {text.category}
            <select name="category" required className="mt-1 min-h-11 w-full border border-line bg-ivory px-3">
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name[locale]}
                </option>
              ))}
            </select>
          </label>
          <PhotoField name="image" required label={text.photo} button={text.choosePhoto} empty={text.noPhoto} />
          <div className="sm:col-span-2">
            <button type="submit" disabled={busy || categories.length === 0} className="inline-flex min-h-12 items-center bg-forest px-5 text-sm font-semibold text-cream disabled:opacity-60">
              {busy ? text.saving : text.save}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-charcoal">{text.products}</h2>
        {products.length === 0 ? <p className="mt-3 text-sm text-moss">{text.empty}</p> : null}
        <ul className="mt-4 space-y-3">
          {products.map((product) => (
            <li key={product.id} className="bg-paper p-4">
              {editing === product.id ? (
                <form onSubmit={(event) => updateProduct(event, product.id)} className="grid gap-3 sm:grid-cols-2">
                  <input name="name" defaultValue={product.name[locale]} required className="min-h-11 border border-line bg-ivory px-3" />
                  <input name="price" type="number" min="0" step="1" defaultValue={product.price} required dir="ltr" className="min-h-11 border border-line bg-ivory px-3" />
                  <select name="category" defaultValue={product.category} className="min-h-11 border border-line bg-ivory px-3">
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name[locale]}
                      </option>
                    ))}
                  </select>
                  <PhotoField name="image" label={text.photo} button={text.choosePhoto} empty={text.noPhoto} />
                  <div className="flex gap-2 sm:col-span-2">
                    <button type="submit" className="inline-flex min-h-11 items-center bg-forest px-4 text-sm font-semibold text-cream">{text.update}</button>
                    <button type="button" onClick={() => setEditing(null)} className="inline-flex min-h-11 items-center border border-line px-4 text-sm">{text.cancel}</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-charcoal">{product.name[locale]}</p>
                    <p className="text-sm text-moss">
                      {product.categoryName[locale]} · <span dir="ltr">{formatPrice(product.price)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditing(product.id)} className="inline-flex min-h-11 items-center border border-line px-3 text-sm">{text.edit}</button>
                    <button type="button" onClick={() => deleteProduct(product.id)} className="inline-flex min-h-11 items-center px-3 text-sm text-moss underline">{text.remove}</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-paper p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-charcoal">{text.categories}</h2>
        <form onSubmit={addCategory} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input name="name" required placeholder={text.categoryName} className="min-h-11 flex-1 border border-line bg-ivory px-3" />
          <button type="submit" className="inline-flex min-h-11 items-center justify-center bg-gold px-4 text-sm font-semibold text-charcoal">{text.addCategory}</button>
        </form>
        <ul className="mt-4 space-y-2">
          {categories.map((item) => (
            <li key={item.id} className="border-b border-line py-2">
              <form key={`${item.id}-${item.name.en}`} onSubmit={(event) => renameCategory(event, item.id)} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input name="name" defaultValue={item.name[locale]} required className="min-h-11 flex-1 border border-line bg-ivory px-3" />
                <button type="submit" className="inline-flex min-h-11 items-center justify-center border border-line px-3 text-sm">{text.rename}</button>
                <button type="button" onClick={() => deleteCategory(item.id)} className="inline-flex min-h-11 items-center justify-center px-3 text-sm text-moss underline">{text.remove}</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
