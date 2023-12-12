# Octoprice - User-friendly Dashboard for Octopus Energy Users

![Octoprice App](https://github.com/edward-designer/dataviz/assets/25171685/de5f7997-4f72-4f52-b8b6-9704aa6744e5)

## Why Octoprice

Obviously, I need to apply for web development jobs and I need CVs and cover letters. A lot of them. There are currently no solutions on the market that fulfuill the following criteria:

- absolute privacy - I want to store my personal data only on my computer
- no vendor lock up - I want to own my data in an easily accessible format
- developer friendly - I want to be able to edit the CVs and cover letters on the web interface as well as my favourite IDE VScode and markdown
- free - I need to make lots of CVs and I don't want to pay anything

## Features

- just need to clone from github repo, install dependencies and run dev/production server locally
- create unlimited variations of CV + Cover Letters fast and easy with the familiar markdown syntax
- check your CV and cover letters for matching keywords from the job advertisements
- download CV / cover letters as text-selectable PDF files readable by applicant tracking system (ATS)
- all data are stored and organized on your computer as markdown files only, no database needed
- can be personalized with favorite color schemes, optionally hacking the PDF styles for a complete personalized look
- a simple job application tracker to visualize your job hunting journey

## To run CVizard locally:

1 Clone this repository

```
  git clone https://github.com/edward-designer/cvizard
```

2 Install dependencies

```
  npm install
```

3 Run the dev server

```
  npm run dev
```

4 Start creating your CVs and cover letters, all files are stored in **`/src/cv directory`**
5 If you would like to implement your own designs, head to **`/src/components/common/PDFContent.tsx`**. Refer to the comments there for making styling changes (both React-PDF and React-PDF-HTML are dependent packages).

## Tech Stacks

- NextJS
  - a framework for both frontend and backend api development
  - SSR for faster response
  - better SEO for the homepage
  - making use of the [ts-nextjs-tailwind-starter](https://theodorusclarence.com/blog/one-stop-starter) by Theodorus Clarence
- Typescript - for type-checking to reduce bugs
- TailwindCSS - fast styling and better CSS rendering performance
- MUI - for icons only
- Jest/React Testing Library for automated testing
- TDD for keyword functions
- Figma - for [logo and UI design](https://www.figma.com/file/bYF7ORx4A9K71xMye006fZ/CVizard?node-id=107%3A72534&t=baIFEMjvq12BDlxY-1)
- CI/CD for automated testing/linting/prettier/type checking using github actions

## Todo

- implement several design templates for users to choose from
- Cypress for end-to-end testing the user journey
