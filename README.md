# Raghav Saxena, portfolio

A static site: plain HTML, CSS and JavaScript. There is no build step, so it runs on any free host.

## What is here

- `index.html`: the home page (opening, the desk, work, experience, education, about, beyond work, contact)
- `work/`: one page per project (7 case studies)
- `resume.html`: the résumé as a web page, with Print and Download buttons
- `assets/Raghav-Saxena-Resume.pdf`: the one-page PDF résumé
- `assets/og.png`: the preview image LinkedIn shows when the link is shared
- `styles.css`, `script.js`: all styling and interactions

## Photos, documents and videos

These are already in place. To swap one, replace the file and keep exactly the same name. A photo or video that is missing hides itself.

`assets/video/` holds the clips in the Beyond work strip: `pickleball-1.mov` to `pickleball-3.mov` and `football-1.mov` to `football-5.mov`. The three pickleball clips are in the iPhone HEVC format, which some browsers (Firefox, older Android phones) cannot play; on those the clip is hidden. Converting them to MP4 (H.264) fixes that. Keep every file under 25 MB, the limit for uploads through the GitHub website.

`assets/img/`
- `portrait.png`
- `pickleball-action.png`
- `pickleball-medal.png`
- `cha-cha-bottle.jpg`
- `cha-cha-research.jpg`
- `cha-cha-pack.jpg`

`assets/docs/`
- `cha-cha-gtm-deck.pdf`
- `ai-insurance-claim-assistant.pdf`
- `financial-copilot.pptx`
- `economics-newsprint.pdf`

## Put it online for free (GitHub + Vercel)

1. Create a free account at github.com, then a new **public** repository, for example `portfolio`.
2. On the repository page choose **Add file > Upload files**. Drag in everything inside this `site` folder (the files and the `work` and `assets` folders, not the `site` folder itself). Commit.
3. Create a free account at vercel.com using **Continue with GitHub**.
4. In Vercel choose **Add New > Project**, pick the repository, leave the framework preset on **Other**, and press **Deploy**. No build settings are needed.
5. Vercel gives you an HTTPS address such as `raghav-saxena.vercel.app`. You can change the name under **Settings > Domains**.

Every later change you upload to GitHub goes live on its own within a minute.

GitHub Pages also works: **Settings > Pages > Deploy from a branch > main / root**. The address is then `username.github.io/portfolio`.

## After the first deploy

- In `index.html`, change the two `assets/og.png` lines near the top to the full address (`https://your-address/assets/og.png`) so LinkedIn shows the preview image.
- Add the site address to the contact line of `resume.html`, then re-create the PDF: open `resume.html` in Chrome or Edge, press Print, choose **Save as PDF**, turn off headers and footers, and save over `assets/Raghav-Saxena-Resume.pdf`.

## Editing

All text is in the HTML files. Open one in any text editor, change the words, save, and upload it again.
