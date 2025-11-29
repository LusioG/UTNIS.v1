document.addEventListener("DOMContentLoaded", () => {
    const hero = document.getElementById("hero");
    const materias = document.getElementById("materias");
    const navbar = document.getElementById("navbar");
    const materiasContainer = document.querySelector(".materias-conteiner");
    const detalleMateria = document.getElementById("detalle-materia");
    const botonInicio = document.querySelector('nav ul li a[href="#"]');
    const enlaceLogo = document.querySelector(".enlace");

    // URLs de Google Sheets
    const sheetMateriasUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYZuMPhFaY7lMP81PbR3bOA9Mj06_cz0nm9hUvhyZrJpJTB4ZQG1-0zTsc06b5Dmej3egS2R3qx61G/pub?gid=0&single=true&output=csv";
    const sheetMaterialesUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYZuMPhFaY7lMP81PbR3bOA9Mj06_cz0nm9hUvhyZrJpJTB4ZQG1-0zTsc06b5Dmej3egS2R3qx61G/pub?gid=739950428&single=true&output=csv";

    // Convierte "Análisis Matemático 1" -> "analisis-matematico-1"
    function slugify(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "-");
    }

    // Carga listado de materias
    async function cargarMaterias() {
        const response = await fetch(sheetMateriasUrl);
        const data = await response.text();
        const filas = data.split("\n").slice(1);
        materiasContainer.innerHTML = "";

        filas.forEach(fila => {
            const [nombre, descripcion] = fila.split(",");
            if (!nombre || !descripcion) return;

            const card = document.createElement("div");
            card.className = "materia-card";
            card.innerHTML = `
                <div class="card-header"></div>
                <div class="card-content">
                    <h3>${nombre.trim()}</h3>
                    <p>${descripcion.trim()}</p>
                    <button data-slug="${slugify(nombre)}">Ver más</button>
                </div>
            `;
            materiasContainer.appendChild(card);
        });

        // Botones "Ver más"
        document.querySelectorAll(".materia-card button").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const nombreMateria = e.target.closest(".materia-card").querySelector("h3").textContent;
                mostrarMateria(nombreMateria);
                window.history.pushState({}, "", "/materias-resumenes-ejercicios/" + slugify(nombreMateria));
            });
        });
    }

    // Mostrar materia y sus materiales
    async function mostrarMateria(nombreMateria) {
        hero.style.display = "none";
        materias.style.display = "none";
        detalleMateria.style.display = "block";
        detalleMateria.innerHTML = `<h1>${nombreMateria}</h1>`;

        const response = await fetch(sheetMaterialesUrl);
        const data = await response.text();
        const filas = data.split("\n").slice(1);
        const tipos = ["1er Parcial", "2do Parcial", "Resúmenes", "Ejercicios"];

        tipos.forEach(tipo => {
            const bloque = document.createElement("section");
            bloque.className = "bloque-material";

            const titulo = document.createElement("h2");
            titulo.textContent = tipo;
            titulo.className = "titulo-parcial";
            bloque.appendChild(titulo);

            const contenedor = document.createElement("div");
            contenedor.className = "versiones-container";
            bloque.appendChild(contenedor);

            let encontrados = 0;
            filas.forEach(fila => {
                const columnas = fila.split(/,|;|\t/);
                if (columnas.length < 4) return;
                const [nombre, contenido, link, descripcion] = columnas.map(c => c.trim());
                if (nombre === nombreMateria && contenido.toLowerCase().includes(tipo.toLowerCase())) {
                    const card = document.createElement("div");
                    card.className = "card-version";
                    card.innerHTML = `<p>${descripcion || "Material sin título"}</p>
                                      <a href="${link}" target="_blank">Ver PDF</a>`;
                    contenedor.appendChild(card);
                    encontrados++;
                }
            });
            if (encontrados === 0) {
                const msg = document.createElement("p");
                msg.className = "mensaje-vacio";
                msg.textContent = `No hay materiales para ${tipo.toLowerCase()}.`;
                bloque.appendChild(msg);
            }

            detalleMateria.appendChild(bloque);
        });
    }

    function volverInicio(e) {
        e.preventDefault();
        hero.style.display = "block";
        materias.style.display = "block";
        detalleMateria.style.display = "none";
        detalleMateria.innerHTML = "";
        window.history.pushState({}, "", "/");
    }

    botonInicio.addEventListener("click", volverInicio);
    enlaceLogo.addEventListener("click", volverInicio);

    cargarMaterias();
});
