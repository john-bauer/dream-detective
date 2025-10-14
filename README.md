# Dream Detective

## About
Dream Detective is a portfolio project that helps you understand your dreams using AI-powered analysis and web search.

## Live Demo

A live demo of this project can be found [here](https://dream-detective.netlify.app/). Please note that the server takes a minute to "wake up", since it's hosted for free.

## Getting Started

This project is broken down into two directories: `frontend` and `backend`. Each has its own respective README with instructions and documentation.

## Inspiration

A week ago, I built my first full-stack agentic application in a similar manner, but it was more of a proof-of-concept, and not something "publishable". So, this project is a re-purposing and polishing of that initial concept. I was trying to think of other use-cases for what I had just built, and dream interpretation seemed like a natural fit. My goal was to create something that could give you helpful insights into what your brain may be trying to tell you.

I identified a handful of sites with thorough summaries about common dream elements, and made them my backend's "preferred sources". Using the [Brave Search API](https://brave.com/search/api/), the system can intelligently search these sites for relevant information, which it then passes along to [Claude](https://claude.ai/) for synthesis and formatting.

## Next Steps

The project is in a stable, working state, and I don't plan on adding any major features. The only changes I plan to make are small frontend tweaks and dependency upgrades. However, if you're interested in building something larger

## Contribution & Use

If you'd like to contribute to this project, you can to submit a PR, report an issue, or [contact me](https://johnbauer.me/contact). You can fork, clone, and use this source code for your own purposes-- all I ask for is a heads up.

Please use the live instance respectfully. There are protections in place to prevent various attacks and forms of overuse, but Claude and Brave Search are not free and my plans have limits. If you found this project useful and want to show your support, feel free to [buy me a coffee](buymeacoffee.com/johnbauer).