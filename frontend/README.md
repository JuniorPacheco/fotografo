# Fotografo Frontend

Frontend de la aplicación Fotografo construido con React, TypeScript, Vite, PicoCSS y Tailwind CSS.

## Requisitos Previos

- Node.js 18+
- npm o yarn

## Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

3. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Páginas/views
│   ├── services/       # Servicios API (axios)
│   ├── types/          # Tipos TypeScript
│   ├── App.tsx         # Componente principal
│   ├── main.tsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── public/             # Archivos estáticos
└── package.json
```

## Tecnologías

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **PicoCSS** - Framework CSS minimalista
- **Tailwind CSS** - Utilidades CSS (cuando sea necesario)

## Scripts

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza build de producción
- `npm run lint` - Ejecuta ESLint

## Credenciales por Defecto

- Email: `admin@admin.com`
- Password: `elmasteradmin`
