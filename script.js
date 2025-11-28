document.addEventListener("DOMContentLoaded", () => {
    // 🔹 Elementos principales
    const hero = document.getElementById("hero");
    const materias = document.getElementById("materias");
    const navbar = document.getElementById("navbar");
    const materiasContainer = document.querySelector(".materias-conteiner");
    const botonInicio = document.querySelector('nav ul li a[href="#"]');

    // 🔹 Contenedor para el detalle de materia
    const detalleMateria = document.createElement("div");
    detalleMateria.id = "detalle-materia";
    detalleMateria.style.display = "none";
    detalleMateria.style.textAlign = "center";
    detalleMateria.style.padding = "50px";
    detalleMateria.style.color = "#fff";
    detalleMateria.innerHTML = "<h1></h1>";
    document.body.appendChild(detalleMateria);

    // 🔹 URLs de tus hojas de Google Sheets
    const sheetMateriasUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYZuMPhFaY7lMP81PbR3bOA9Mj06_cz0nm9hUvhyZrJpJTB4ZQG1-0zTsc06b5Dmej3egS2R3qx61G/pub?gid=0&single=true&output=csv";
    const sheetMaterialesUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYZuMPhFaY7lMP81PbR3bOA9Mj06_cz0nm9hUvhyZrJpJTB4ZQG1-0zTsc06b5Dmej3egS2R3qx61G/pub?gid=739950428&single=true&output=csv";

    // ============================================================
    // 1️⃣ Cargar materias
    // ============================================================
    async function cargarMaterias() {
        try {
            const response = await fetch(sheetMateriasUrl);
            const data = await response.text();
            const filas = data.split("\n").slice(1);

            materiasContainer.innerHTML = "";

            filas.forEach(fila => {
                const [nombre, descripcion] = fila.split(",");
                if (!nombre || !descripcion) return;

                const descripcionLimpia = descripcion.trim().replace(/;/g, ",");

                const card = document.createElement("div");
                card.className = "materia-card";
                card.innerHTML = `
                    <div class="card-header"></div>
                    <div class="card-content">
                        <h3>${nombre.trim()}</h3>
                        <p>${descripcionLimpia}</p>
                        <button>Ver más</button>
                    </div>
                `;
                materiasContainer.appendChild(card);
            });

            activarBotones();
        } catch (error) {
            console.error("❌ Error al cargar materias:", error);
        }
    }

    // ============================================================
    // 2️⃣ Cargar materiales
    // ============================================================
    async function cargarMateriales(nombreMateria) {
        try {
            const response = await fetch(sheetMaterialesUrl);
            const data = await response.text();
            const filas = data.split("\n").slice(1);

            // Limpiar detalles previos
            detalleMateria.innerHTML = "<h1></h1>";
            const tipos = ["1er Parcial", "2do Parcial", "Resúmenes", "Ejercicios"];

            tipos.forEach(tipo => {
                const contenedorTipo = document.createElement("section");
                contenedorTipo.className = "bloque-material";

                const titulo = document.createElement("h2");
                titulo.textContent = tipo;
                titulo.className = "titulo-parcial";
                contenedorTipo.appendChild(titulo);

                const contenedorVersiones = document.createElement("div");
                contenedorVersiones.className = "versiones-container";
                contenedorTipo.appendChild(contenedorVersiones);

                let encontrados = 0;

                filas.forEach(fila => {
                    const columnas = fila.split(/,|;|\t/);
                    if (columnas.length < 4) return;

                    const [nombre, contenido, link, descripcion] = columnas.map(c => c.trim());

                    if (
                        nombre.toLowerCase() === nombreMateria.toLowerCase() &&
                        contenido.toLowerCase().includes(tipo.toLowerCase())
                    ) {
                        const card = document.createElement("div");
                        card.className = "card-version";
                        card.innerHTML = `
                            <p>${descripcion || "Material sin título"}</p>
                            <a href="${link}" target="_blank">Ver PDF</a>
                        `;
                        contenedorVersiones.appendChild(card);
                        encontrados++;
                    }
                });

                if (encontrados === 0) {
                    const msg = document.createElement("p");
                    msg.textContent = `No hay materiales disponibles para ${tipo.toLowerCase()}.`;
                    msg.className = "mensaje-vacio";
                    contenedorTipo.appendChild(msg);
                }

                detalleMateria.appendChild(contenedorTipo);
            });

            detalleMateria.querySelector("h1").textContent = nombreMateria;
            detalleMateria.style.display = "block";

        } catch (error) {
            console.error("❌ Error al cargar materiales:", error);
        }
    }

    // ============================================================
    // 3️⃣ Botones "Ver más" e "Inicio"
    // ============================================================
    function activarBotones() {
        const botonesVerMas = document.querySelectorAll(".materia-card button");

        botonesVerMas.forEach(boton => {
            boton.addEventListener("click", (e) => {
                const nombreMateria = e.target.closest(".materia-card").querySelector("h3").textContent;

                hero.style.display = "none";
                materias.style.display = "none";
                navbar.style.display = "block";

                cargarMateriales(nombreMateria);
            });
        });
    }

    // 🔸 Botón de Inicio
    botonInicio.addEventListener("click", (e) => {
        e.preventDefault();
        hero.style.display = "block";
        materias.style.display = "block";
        navbar.style.display = "block";

        // 🔹 Limpiar contenido previo
        detalleMateria.style.display = "none";
        detalleMateria.innerHTML = "<h1></h1>";
    });

    // ============================================================
    // 4️⃣ Ejecutar al iniciar
    // ============================================================
    cargarMaterias();

    // 🔹 Menu hamburguesa se cierra automáticamente
    document.querySelectorAll('nav ul li a').forEach(enlace => {
        enlace.addEventListener('click', () => {
            document.getElementById('check').checked = false;
        });
    });
});
