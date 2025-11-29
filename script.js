document.addEventListener("DOMContentLoaded", () => {
    // 🔹 Elementos principales
    const hero = document.getElementById("hero");
    const materias = document.getElementById("materias");
    const navbar = document.getElementById("navbar");
    const materiasContainer = document.querySelector(".materias-conteiner");
    const botonInicio = document.querySelector('nav ul li a[href="#"]');
    const enlaceLogo = document.querySelector(".enlace"); // << NUEVO

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


function cargarEjercicios() {
    const boton = document.getElementById("practica");

    boton.addEventListener("click", async () => {

        // Ocultar secciones normales
        hero.style.display = "none";
        materias.style.display = "none";
        navbar.style.display = "block";

        // Limpiar pantalla anterior
        detalleMateria.style.display = "block";
        detalleMateria.innerHTML = "<h1>Ejercicios</h1>";

        // Cargar materiales desde el sheet
        try {
            const response = await fetch(sheetMaterialesUrl);
            const data = await response.text();
            const filas = data.split("\n").slice(1);

            // Crear bloque especial para ejercicios
            const bloque = document.createElement("section");
            bloque.className = "bloque-material";

            // Crear buscadorr para ejercicios
            const buscador = document.createElement("input");
            buscador.type = "text";
            buscador.placeholder = "Buscar ejercicios...";
            buscador.className = "buscador-input";

            buscador.style.width = "70%";
            buscador.style.padding = "12px";
            buscador.style.margin = "20px 0";
            buscador.style.fontSize = "1.1rem";
            buscador.style.borderRadius = "8px";
            buscador.style.border = "1px solid #ccc";

            bloque.appendChild(buscador);

            const contenedor = document.createElement("div");
            contenedor.className = "versiones-container";
            bloque.appendChild(contenedor);
            
            // Filtra ejercicios en base a lo que ingrese el usuario
            buscador.addEventListener("input", () => {
            const texto = buscador.value.toLowerCase();

            const cards = contenedor.querySelectorAll(".card-version");

            cards.forEach(card => {
                const contenidoCard = card.textContent.toLowerCase();
                card.style.display = contenidoCard.includes(texto) ? "block" : "none";
            });
            });

            let encontrados = 0;

            filas.forEach(fila => {
                const columnas = fila.split(/,|;|\t/);
                if (columnas.length < 4) return;

                const [nombre, contenido, link, descripcion] = columnas.map(c => c.trim());

                // Filtrar SOLO ejercicios
                if (contenido.toLowerCase() !== "ejercicios") return;

                const card = document.createElement("div");
                card.className = "card-version";

                card.innerHTML = `
                    <p>${descripcion || "Ejercicio"}</p>
                    <a href="${link}" target="_blank">Ver PDF</a>
                `;

                contenedor.appendChild(card);
                encontrados++;
            });

            if (encontrados === 0) {
                const msg = document.createElement("p");
                msg.className = "mensaje-vacio";
                msg.textContent = "No hay ejercicios cargados aún.";
                bloque.appendChild(msg);
            }

            detalleMateria.appendChild(bloque);

        } catch (error) {
            console.error("❌ Error al cargar ejercicios:", error);

            detalleMateria.innerHTML = "<h1>Error al cargar ejercicios</h1>";
        }
    });
}

    cargarEjercicios();

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

    // 🔸 Función para volver al inicio (reutilizada por logo e inicio)
    function volverInicio(e) {
        e.preventDefault();
        hero.style.display = "block";
        materias.style.display = "block";
        navbar.style.display = "block";

        detalleMateria.style.display = "none";
        detalleMateria.innerHTML = "<h1></h1>";
    }

    // 🔹 Botón de Inicio
    botonInicio.addEventListener("click", volverInicio);

    // 🔹 Logo UTNIS hace lo mismo que INICIO
    enlaceLogo.addEventListener("click", volverInicio);

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
