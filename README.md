![CelebrateConnectLogo](./public/assets/images/logo.svg)

<div align="center">
    <img src="https://img.shields.io/badge/-Next_JS_14-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000" alt="Next.js" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="TypeScript" />
    <img src="https://img.shields.io/badge/-Stripe-black?style=for-the-badge&logoColor=white&logo=stripe&color=008CDD" alt="stripe" />
</div>

<h3 align="center">CelebrateConnect</h3>

##  🗒️ [Table of Contents](#table)

1. 📣 [Introduction](#introduction)
2. 🛠️ [Tech Stack](#tech-stack)
3. 💡 [Features](#features)
4. 🚀 [Quick Start](#quick-start)

## <a name="introduction">📣 Introduction</a>

Utilizing the Next.js 14 framework, the events application emerges as an all-encompassing, full-stack solution designed for event management. Functioning as a central hub, it highlights a wide array of global events. With integrated Stripe support, the platform facilitates effortless payment transactions, enabling users to buy event tickets or take charge of organizing and overseeing their own events.

## <a name="tech-stack">🛠️ Tech Stack</a>

- Node.js
- Next.js
- TypeScript
- TailwindCSS
- Stripe
- Zod
- React Hook Form
- Shadcn
- uploadthing

## <a name="features">💡 Features</a>

🔹 **Clerk Authentication (CRUD):** Effective user management utilizing Clerk for secure and streamlined authentication processes.

🔹 **Events Management (CRUD):** Robust functionality for creating, viewing, updating, and deleting events, granting users complete control over event organization.

- **Create Events:** Users can effortlessly generate new events by inputting essential details such as title, date, location, and additional information.
- **View Events:** Access a detailed overview of all events, allowing users to explore event specifics like descriptions, schedules, and related details.
- **Modify Events:** Empower users to dynamically update event details, ensuring accuracy and timeliness.
- **Delete Events:** Streamlined process for removing events, empowering administrators to efficiently curate the platform.

🔹 **Connected Events:** Intelligent linking of related events displayed on the event details page, enhancing user engagement.

🔹 **Organized Events Display:** Efficiently arrange events for a structured and user-friendly presentation, including showcasing user-created events on profiles.

🔹 **Search & Filter:** Provide users with a powerful search and filter system to easily discover events matching their preferences.

🔹 **Dynamic Category Addition:** Seamless incorporation of new event categories, ensuring platform adaptability.

🔹 **Stripe Checkout:** Ensure smooth and secure payment transactions through Stripe, enhancing the user experience during checkout.

🔹 **Event Orders Management:** Comprehensive system for managing event-related transactions, offering a clear overview.

🔹 **Order Search:** Quick and efficient search functionality for orders, facilitating easy tracking and management.

And many more features, including considerations for code architecture and reusability.

## <a name="quick-start">🚀 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**Cloning the Repository**

```bash
git clone https://github.com/pyroblazer/next-events-web.git
cd next-events-web
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
#NEXT
NEXT_PUBLIC_SERVER_URL=

#CLERK
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_CLERK_WEBHOOK_SECRET=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

#MONGODB
MONGODB_URI=

#UPLOADTHING
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

#STRIPE
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Replace the placeholder values with your actual credentials

**Running the Project**

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.
