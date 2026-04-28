import { db } from "./db";
import fs from "fs";

// =====================
// Helper: Render Layout
// =====================
function render(content: string): string {
  const layout = fs.readFileSync("./views/layout/main.html", "utf8");
  return layout.replace("{{content}}", content);
}

// =====================
// Bun HTTP Server
// =====================
Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // ========================
    // DASHBOARD - GET /
    // ========================
    if (method === "GET" && path === "/") {
      const [rows]: any = await db.query(
        "SELECT COUNT(*) as total FROM mahasiswa"
      );
      let view = fs.readFileSync("./views/dashboard/index.html", "utf8");
      view = view.replace("{{total}}", rows[0].total);
      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // ========================
    // LIST MAHASISWA - GET /mahasiswa
    // ========================
    if (method === "GET" && path === "/mahasiswa") {
      const [rows]: any = await db.query("SELECT * FROM mahasiswa");
      let table = "";

      if (rows.length === 0) {
        table = `
          <tr>
            <td colspan="5" class="px-6 py-8 text-center text-gray-400">
              Belum ada data mahasiswa.
            </td>
          </tr>`;
      } else {
        rows.forEach((m: any) => {
          table += `
            <tr class="hover:bg-gray-50 transition">
              <td class="px-6 py-4 text-gray-700">${m.id}</td>
              <td class="px-6 py-4 font-medium text-gray-800">${m.nama}</td>
              <td class="px-6 py-4 text-gray-600">${m.jurusan}</td>
              <td class="px-6 py-4 text-gray-600">${m.angkatan}</td>
              <td class="px-6 py-4 text-center">
                <a href="/mahasiswa/edit/${m.id}"
                   class="inline-block bg-yellow-400 text-white text-sm px-3 py-1 rounded mr-2 hover:bg-yellow-500 transition">
                  Edit
                </a>
                <a href="/mahasiswa/delete/${m.id}"
                   onclick="return confirm('Yakin hapus data ini?')"
                   class="inline-block bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 transition">
                  Hapus
                </a>
              </td>
            </tr>`;
        });
      }

      let view = fs.readFileSync("./views/mahasiswa/index.html", "utf8");
      view = view.replace("{{rows}}", table);
      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // ========================
    // FORM TAMBAH - GET /mahasiswa/create
    // ========================
    if (method === "GET" && path === "/mahasiswa/create") {
      const view = fs.readFileSync("./views/mahasiswa/create.html", "utf8");
      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // ========================
    // SIMPAN DATA - POST /mahasiswa/store
    // ========================
    if (method === "POST" && path === "/mahasiswa/store") {
      const body = await req.formData();
      const nama = body.get("nama");
      const jurusan = body.get("jurusan");
      const angkatan = body.get("angkatan");

      await db.query(
        "INSERT INTO mahasiswa (nama, jurusan, angkatan) VALUES (?, ?, ?)",
        [nama, jurusan, angkatan]
      );

      return Response.redirect("/mahasiswa", 302);
    }

    // ========================
    // FORM EDIT - GET /mahasiswa/edit/:id
    // ========================
    if (method === "GET" && path.startsWith("/mahasiswa/edit/")) {
      const id = path.split("/")[3];
      const [rows]: any = await db.query(
        "SELECT * FROM mahasiswa WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return new Response("Data tidak ditemukan", { status: 404 });
      }

      const m = rows[0];
      let view = fs.readFileSync("./views/mahasiswa/edit.html", "utf8");
      view = view
        .replace("{{id}}", m.id)
        .replace("{{nama}}", m.nama)
        .replace("{{jurusan}}", m.jurusan)
        .replace("{{angkatan}}", m.angkatan);

      return new Response(render(view), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // ========================
    // UPDATE DATA - POST /mahasiswa/update/:id
    // ========================
    if (method === "POST" && path.startsWith("/mahasiswa/update/")) {
      const id = path.split("/")[3];
      const body = await req.formData();
      const nama = body.get("nama");
      const jurusan = body.get("jurusan");
      const angkatan = body.get("angkatan");

      await db.query(
        "UPDATE mahasiswa SET nama = ?, jurusan = ?, angkatan = ? WHERE id = ?",
        [nama, jurusan, angkatan, id]
      );

      return Response.redirect("/mahasiswa", 302);
    }

    // ========================
    // HAPUS DATA - GET /mahasiswa/delete/:id
    // ========================
    if (method === "GET" && path.startsWith("/mahasiswa/delete/")) {
      const id = path.split("/")[3];
      await db.query("DELETE FROM mahasiswa WHERE id = ?", [id]);
      return Response.redirect("/mahasiswa", 302);
    }

    // ========================
    // 404 Not Found
    // ========================
    return new Response(
      render(`
        <div class="text-center mt-20">
          <h2 class="text-4xl font-bold text-gray-400">404</h2>
          <p class="text-gray-500 mt-2">Halaman tidak ditemukan</p>
          <a href="/" class="mt-4 inline-block text-blue-600 hover:underline">← Kembali ke Dashboard</a>
        </div>
      `),
      { status: 404, headers: { "Content-Type": "text/html" } }
    );
  },
});

console.log("✅ Server berjalan di http://localhost:3000");