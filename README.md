# Dream Detective

## About
Dream Detective is a portfolio project that helps you understand your dreams using AI-powered analysis and web search.

## Live Demo

A live demo of this project can be found [here](https://dream-detective.netlify.app/).

## Getting Started

This project is broken down into two directories: `frontend` and `backend`. Each has its own respective README with instructions and documentation.

## Inspiration

A week ago, I built my first full-stack agentic application in a similar manner, but it was more of a proof-of-concept, and not something "publishable". So, this project is a re-purposing and polishing of that initial concept. I was trying to think of other use-cases for what I had just built, and dream interpretation seemed like a natural fit. My goal was to create something that could give you helpful insights into what your brain may be trying to tell you.

I identified a handful of sites with thorough summaries about common dream elements, and made them my backend's "preferred sources". Using the [Brave Search API](https://brave.com/search/api/), the system can intelligently search these sites for relevant information, which it then passes along to [Claude](https://claude.ai/) for synthesis and formatting.