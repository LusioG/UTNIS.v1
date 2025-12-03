document.addEventListener("DOMContentLoaded", () => {
    const hero = document.getElementById("hero");
    const materias = document.getElementById("materias");
    const materiasContainer = document.querySelector(".materias-conteiner");
    const detalleMateria = document.getElementById("detalle-materia");
    const botonInicio = document.querySelector('nav ul li a[href="#"]');
    const enlaceLogo = document.querySelector(".enlace");
    const botonEjercicios = document.getElementById("practica");

    const sheetMateriasUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYZuMPhFaY7lMP81PbR3bOA9Mj06_cz0nm9hUvhyZrJpJTB4ZQG1-0zTsc06b5Dmej3egS2R3qx61G/pub?gid=0&single=true&output=csv";
    const sheetMaterialesUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYZuMPhFaY7lMP81PbR3bOA9Mj06_cz0nm9hUvhyZrJpJTB4ZQG1-0zTsc06b5Dmej3egS2R3qx61G/pub?gid=739950428&single=true&output=csv";

    function normalizar(texto) {
        return (texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    }

    function slugify(text) {
        return normalizar(text).replace(/\s+/g, "-");
    }

    function limpiarLatex(latexString) {
        if (!latexString) return "";
        let limpio = String(latexString).trim();
        limpio = limpio.replace(/^"(.*)"$/, "$1");
        limpio = limpio.replace(/\uFEFF/g, "");
        limpio = limpio.replace(/[\u2016]/g, "");
        return limpio;
    }



    
    // ============================
    //      SPLIT EN 4 COMAS
    // ============================
    function splitPrimeras4Comas(linea) {
        const partes = [];
        let actual = "";
        let comas = 0;

        for (let i = 0; i < linea.length; i++) {
            const c = linea[i];
            if (c === "," && comas < 4) {
                partes.push(actual.trim());
                actual = "";
                comas++;
            } else {
                actual += c;
            }
        }

        partes.push(actual.trim());
        return partes;
    }

    // ============================
    //      CARGAR MATERIAS
    // ============================
    async function cargarMaterias() {
        const response = await fetch(sheetMateriasUrl);
        const data = await response.text();
        const filas = data.split("\n").slice(1);
        materiasContainer.innerHTML = "";

        filas.forEach(fila => {
            if (!fila || !fila.trim()) return;

            let cols = splitPrimeras4Comas(fila);

            const nombre = cols[0];
            const descripcion = cols[1];

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

        document.querySelectorAll(".materia-card button").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const nombreMateria = e.target.closest(".materia-card").querySelector("h3").textContent;
                mostrarMateria(nombreMateria);
                window.history.pushState({}, "", "/materias-resumenes-ejercicios/" + slugify(nombreMateria));
            });
        });
    }

    // ============================
    //   MOSTRAR MATERIA DETALLE
    // ============================
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
                if (!fila || !fila.trim()) return;

                let datos = splitPrimeras4Comas(fila);

                if (datos.length < 5) return;

                const materia = datos[0];
                const contenido = datos[1];
                const linkPDF = datos[2];
                const descripcion = datos[3];
                const codigoLatex = datos[4];

                if (normalizar(materia) === normalizar(nombreMateria) &&
                    normalizar(contenido).includes(normalizar(tipo))) {

                    const latexLimpio = limpiarLatex(codigoLatex);

                    const mediaHTML = latexLimpio
                        ? `<div class="ecuacion-container">$$${latexLimpio}$$</div>`
                        : `<div class="ecuacion-container placeholder">Ecuación no disponible</div>`;

                    const card = document.createElement("div");
                    card.className = "card-version";

                    card.innerHTML = `
                        ${mediaHTML}
                        <p>${descripcion || "Material sin título"}</p>
                        <a href="${linkPDF}" target="_blank">Ver PDF</a>
                    `;

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

        if (window.MathJax) window.MathJax.typesetPromise();
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

    // ============================
    //         EJERCICIOS
    // ============================
    botonEjercicios.addEventListener("click", async () => {
        hero.style.display = "none";
        materias.style.display = "none";
        detalleMateria.style.display = "block";
        detalleMateria.innerHTML = `<h1>Ejercicios</h1>`;

        const response = await fetch(sheetMaterialesUrl);
        const data = await response.text();
        const filas = data.split("\n").slice(1);

        const bloque = document.createElement("section");
        bloque.className = "bloque-material";

        const buscador = document.createElement("input");
        buscador.type = "text";
        buscador.placeholder = "Buscar ejercicios...";
        buscador.className = "buscador-input";
        bloque.appendChild(buscador);

        const contenedor = document.createElement("div");
        contenedor.className = "versiones-container";
        bloque.appendChild(contenedor);

        filas.forEach(fila => {
            if (!fila || !fila.trim()) return;

            let datos = splitPrimeras4Comas(fila);

            if (datos.length < 5) return;

            const contenido = datos[1];
            const linkPDF = datos[2];
            const descripcion = datos[3];
            const codigoLatex = datos[4];

            if (normalizar(contenido) !== "ejercicios") return;

            const latexLimpio = limpiarLatex(codigoLatex);

            const mediaHTML = latexLimpio
                ? `<div class="ecuacion-container">$$${latexLimpio}$$</div>`
                : `<div class="ecuacion-container placeholder">Ecuación no disponible</div>`;

            const card = document.createElement("div");
            card.className = "card-version";

            card.innerHTML = `
                ${mediaHTML}
                <p>${descripcion}</p>
                <a href="${linkPDF}" target="_blank">Ver PDF</a>
            `;

            contenedor.appendChild(card);
        });

        detalleMateria.appendChild(bloque);

        buscador.addEventListener("input", () => {
            const texto = buscador.value.toLowerCase();
            contenedor.querySelectorAll(".card-version").forEach(card => {
                card.style.display = card.textContent.toLowerCase().includes(texto)
                    ? "block"
                    : "none";
            });
        });

        if (window.MathJax) window.MathJax.typesetPromise();
    });
});
document.querySelectorAll("nav ul li a").forEach(link => {
    link.addEventListener("click", () => {
        const check = document.getElementById("check");
        if (check.checked) check.checked = false;
    });
});