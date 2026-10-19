import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// Read-only count used by scripts/verify.mjs to prove triggers don't pile up across navigation.
;(window as Window & { __scrollTriggerCount?: () => number }).__scrollTriggerCount = () => ScrollTrigger.getAll().length

export { gsap, ScrollTrigger, useGSAP }
