<template>
  <main class="page-shell legal-page">
    <article class="legal-card">
      <RouterLink class="legal-back-link" to="/">
        <span aria-hidden="true">←</span>
        Alle Spiele
      </RouterLink>

      <p class="eyebrow">Rechtliches</p>
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
          <p v-if="section.notice" class="legal-notice">{{ section.notice }}</p>
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
  notice?: string
}

interface LegalContent {
  title: string
  intro: string
  sections: LegalSection[]
}

const props = defineProps<{ page: LegalPageKind }>()

const content = computed<LegalContent>(() => {
  if (props.page === 'imprint') {
    return {
      title: 'Impressum',
      intro: 'Angaben zum Anbieter dieser Website.',
      sections: [
        {
          title: 'Angaben gemäß § 5 DDG',
          paragraphs: [
            'Henri Dickel',
            'Solver Collection ist ein nicht-kommerzielles Hobbyprojekt.',
          ],
          link: {
            href: 'https://github.com/HenriDickel/',
            label: 'Kontakt über GitHub',
          },
        },
      ],
    }
  }

  if (props.page === 'accessibility') {
    return {
      title: 'Barrierefreiheit',
      intro: 'Solver Collection soll für möglichst viele Menschen gut nutzbar sein.',
      sections: [
        {
          title: 'Unser Anspruch',
          paragraphs: [
            'Die Oberfläche verwendet klare Kontraste, semantische Bedienelemente und sichtbare Tastaturfokusse. Animationen werden bei aktivierter System-Einstellung für reduzierte Bewegung stark verkürzt.',
          ],
        },
        {
          title: 'Bekannte Grenzen',
          paragraphs: [
            'Die interaktiven Spielfelder werden fortlaufend auf eine bessere Bedienung mit Tastatur und assistiven Technologien geprüft.',
          ],
        },
        {
          title: 'Feedback',
          paragraphs: [
            'Wenn du auf eine Barriere stößt, melde sie bitte über das GitHub-Profil.',
          ],
          link: {
            href: 'https://github.com/HenriDickel/',
            label: 'Feedback über GitHub',
          },
        },
      ],
    }
  }

  return {
    title: 'Datenschutzerklärung',
    intro: 'Hier erfährst du, welche Daten beim Besuch von Solver Collection verarbeitet werden.',
    sections: [
      {
        title: 'Verantwortliche Stelle',
        paragraphs: [
          'Henri Dickel ist für diese Website verantwortlich.',
        ],
        link: {
          href: 'https://github.com/HenriDickel/',
          label: 'Kontakt über GitHub',
        },
      },
      {
        title: 'Verarbeitung in der Anwendung',
        paragraphs: [
          'Solver Collection ist ein statisches Frontend. Die Anwendung bietet keine Registrierung, kein Kontaktformular sowie keine eingebundenen Analyse- oder Werbedienste.',
          'Eingaben in den Spielbrettern werden nur für die aktuelle Nutzung im Browser verarbeitet. Nach dem derzeitigen Stand des Projekts werden sie nicht an einen eigenen Server übertragen.',
        ],
      },
      {
        title: 'Hosting über GitHub Pages',
        paragraphs: [
          'Die Website wird über GitHub Pages bereitgestellt. Beim Aufruf protokolliert GitHub nach eigenen Angaben die IP-Adresse von Besuchenden aus Sicherheitsgründen.',
        ],
        link: {
          href: 'https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages',
          label: 'Informationen von GitHub Pages zum Hosting und zur Protokollierung',
        },
      },
      {
        title: 'Weitere Informationen',
        paragraphs: [
          'Informationen zur Datenverarbeitung durch GitHub findest du in der Datenschutzerklärung von GitHub.',
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
