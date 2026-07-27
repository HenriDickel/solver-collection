<template>
  <main class="page-shell legal-page">
    <article class="legal-card">
      <RouterLink class="legal-back-link" to="/">
        <span aria-hidden="true">&larr;</span>
        All games
      </RouterLink>

      <p class="eyebrow">Legal</p>
      <h1>{{ content.title }}</h1>
      <p class="legal-lede">{{ content.intro }}</p>

      <div class="legal-sections">
        <section v-for="section in content.sections" :key="section.title" class="legal-section">
          <h2>{{ section.title }}</h2>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          <ul v-if="section.items">
            <li v-for="item in section.items" :key="item">{{ item }}</li>
          </ul>
          <p v-if="section.link">
            <a :href="section.link.href" target="_blank" rel="noreferrer">{{ section.link.label }}</a>
          </p>
        </section>
      </div>
    </article>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

type LegalPageKind = 'privacy' | 'imprint' | 'accessibility'

interface LegalLink {
  href: string
  label: string
}

interface LegalSection {
  title: string
  paragraphs: string[]
  items?: string[]
  link?: LegalLink
}

interface LegalContent {
  title: string
  intro: string
  sections: LegalSection[]
}

const props = defineProps<{ page: LegalPageKind }>()

const githubProfile = {
  href: 'https://github.com/HenriDickel/',
  label: 'Contact via GitHub',
}

const content = computed<LegalContent>(() => {
  if (props.page === 'imprint') {
    return {
      title: 'Legal Notice',
      intro: 'Information about the operator of this website.',
      sections: [
        {
          title: 'Operator',
          paragraphs: [
            'Henri Dickel',
            'Solver Collection is a non-commercial hobby project.',
          ],
          link: githubProfile,
        },
      ],
    }
  }

  if (props.page === 'accessibility') {
    return {
      title: 'Accessibility',
      intro: 'Solver Collection aims to be usable by as many people as possible.',
      sections: [
        {
          title: 'Our approach',
          paragraphs: [
            'The interface uses clear contrast, semantic controls, and visible keyboard focus. Animations are greatly reduced when the operating system requests reduced motion.',
          ],
        },
        {
          title: 'Known limitations',
          paragraphs: [
            'The interactive boards are continuously reviewed to improve keyboard and assistive-technology support.',
          ],
        },
        {
          title: 'Feedback',
          paragraphs: [
            'If you encounter a barrier, please report it through the GitHub profile.',
          ],
          link: {
            ...githubProfile,
            label: 'Send accessibility feedback via GitHub',
          },
        },
      ],
    }
  }

  return {
    title: 'Privacy Policy',
    intro: 'This page explains what data is processed when you visit Solver Collection.',
    sections: [
      {
        title: 'Controller',
        paragraphs: [
          'Henri Dickel is responsible for this website.',
        ],
        link: githubProfile,
      },
      {
        title: 'Processing in the application',
        paragraphs: [
          'Solver Collection is a static frontend. It has no registration, contact form, analytics, or advertising services.',
          'Puzzle input is processed only in your browser for the current visit. The application does not transmit it to its own server.',
        ],
      },
      {
        title: 'Hosting with GitHub Pages',
        paragraphs: [
          'This website is hosted through GitHub Pages. GitHub states that it logs visitors’ IP addresses for security purposes when a Pages site is visited.',
        ],
        link: {
          href: 'https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages',
          label: 'GitHub Pages hosting and logging information',
        },
      },
      {
        title: 'More information',
        paragraphs: [
          'Further information about GitHub’s data processing is available in its privacy statement.',
        ],
        link: {
          href: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
          label: 'GitHub Privacy Statement',
        },
      },
    ],
  }
})
</script>
