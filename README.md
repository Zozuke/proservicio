# ProServicio 🔧

**Cotiza, agenda y cobra fácil** — PWA para trabajadores de oficios independientes.

Cotiza, agenda y cobra desde el celular. Para plomeros, electricistas, albañiles, pintores y cualquier trabajador independiente.

---

## 🚀 Cómo poner esto a funcionar (paso a paso)

### PASO 1 — Crea tu cuenta de Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratis
2. Crea un nuevo proyecto (guarda la contraseña)
3. Ve a **Settings → API** y copia:
   - `Project URL` → esto es tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → esto es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → esto es tu `SUPABASE_SERVICE_ROLE_KEY`

4. Ve a **SQL Editor** en Supabase y pega todo el contenido de `supabase-schema.sql` y ejecútalo

---

### PASO 2 — Crea tu cuenta de Stripe

1. Ve a [stripe.com](https://stripe.com) y crea una cuenta gratis
2. Ve a **Developers → API Keys** y copia:
   - `Publishable key` → esto es tu `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → esto es tu `STRIPE_SECRET_KEY`

3. Para el webhook (cuando el cliente paga):
   - Ve a **Developers → Webhooks**
   - Agrega un endpoint: `https://TU-APP.vercel.app/api/payment-success`
   - Copia el `Signing secret` → esto es tu `STRIPE_WEBHOOK_SECRET`

---

### PASO 3 — Sube el código a GitHub

```bash
# En tu computadora, dentro de la carpeta proservicio:
git init
git add .
git commit -m "ProServicio MVP"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/proservicio.git
git push -u origin main
```

---

### PASO 4 — Despliega en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea cuenta con tu GitHub
2. Haz clic en **"Add New Project"**
3. Selecciona tu repositorio `proservicio`
4. Antes de hacer clic en Deploy, agrega las **variables de entorno**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://TU-APP.vercel.app
```

5. Haz clic en **Deploy** 🚀

---

### PASO 5 — Instalar como app en el celular

#### En iPhone:
1. Abre Safari y ve a tu URL de Vercel
2. Toca el botón de compartir (cuadro con flecha)
3. Selecciona **"Agregar a pantalla de inicio"**
4. ¡Listo! La app aparece como ícono en tu celular

#### En Android:
1. Abre Chrome y ve a tu URL de Vercel
2. Toca los 3 puntos del menú
3. Selecciona **"Agregar a pantalla de inicio"**
4. ¡Listo!

---

## 📱 Cómo usar la app

### Flujo principal:
1. **Crea un cliente** → Clientes → Nuevo cliente
2. **Crea una cotización** → Cotizaciones → Nueva cotización
3. **Comparte el link** → La app genera un link bonito
4. **Mándalo por WhatsApp** → El cliente ve la cotización y paga
5. **Recibes el dinero** → Directo en tu cuenta de banco vía Stripe

---

## 💰 Comisión

La app cobra **2% de comisión** sobre cada pago procesado, además del 2.9% que cobra Stripe.

Ejemplo con un trabajo de $1,000:
- Stripe se lleva: $29 (2.9%)
- ProServicio se lleva: $20 (2%)
- **Juan recibe: $951**

---

## 🗂 Estructura del proyecto

```
proservicio/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Login / Registro
│   │   ├── dashboard/            # Pantalla principal
│   │   ├── quotes/               # Cotizaciones
│   │   │   ├── page.tsx          # Lista
│   │   │   ├── new/page.tsx      # Nueva cotización
│   │   │   └── [id]/page.tsx     # Detalle
│   │   ├── jobs/                 # Trabajos
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── clients/              # Clientes
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── settings/             # Configuración
│   │   ├── quote/[token]/        # Página pública del cliente
│   │   └── api/                  # APIs de Stripe
│   ├── components/
│   │   └── BottomNav.tsx         # Navegación inferior
│   └── lib/
│       ├── supabase.ts           # Base de datos
│       ├── i18n.ts               # Español / Inglés
│       ├── auth-context.tsx      # Sesión del usuario
│       └── lang-context.tsx      # Idioma
├── public/
│   └── manifest.json             # Configuración PWA
├── supabase-schema.sql           # Ejecutar en Supabase
└── .env.example                  # Variables de entorno
```

---

## 🛠 Stack tecnológico

| Herramienta | Para qué | Costo |
|---|---|---|
| Next.js 14 | La app | Gratis |
| Tailwind CSS | El diseño | Gratis |
| Supabase | Base de datos + Auth | Gratis hasta escalar |
| Stripe | Cobros | Gratis hasta cobrar |
| Vercel | Publicar en internet | Gratis |

**Costo total para empezar: $0**

---

## 📞 Soporte

¿Dudas? Revisa la documentación de:
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
