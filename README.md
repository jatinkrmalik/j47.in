# j47.in - Personal Website

![Jekyll](https://img.shields.io/badge/Jekyll-4.2.2-blue)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-brightgreen)

A modern personal website built using Jekyll 4+ and deployed to GitHub Pages.

## Features
- Responsive design
- Blog functionality
- Custom 404 page
- GitHub Actions CI/CD pipeline
- Easy content management through Markdown

## Project Structure
```
j47.in/
├── _config.yml       # Main configuration
├── _data/            # Data files
├── _posts/           # Blog posts
├── 404.html          # Custom 404 page
├── index.markdown    # Main page content
├── Gemfile           # Ruby dependencies
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites
- Ruby 2.7+
- Bundler

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   bundle install
   ```
3. Run the development server:
   ```bash
   bundle exec jekyll serve
   ```

## Contributing
1. Create a new branch
2. Make your changes
3. Submit a pull request

## Deployment
The site is automatically deployed to GitHub Pages through GitHub Actions. See the workflow in `.github/workflows/`.

## License
MIT License - See [LICENSE](LICENSE) for more information.

## Acknowledgments
- Inspired by [Hacked-Jekyll](https://github.com/jatinkrmalik/hacked-jekyll)
- Deployment guide from [Moncef Belyamani](https://www.moncefbelyamani.com/making-github-pages-work-with-latest-jekyll)

