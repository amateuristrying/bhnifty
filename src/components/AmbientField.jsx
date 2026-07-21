import { useEffect, useRef } from 'react'
import { motionOK } from '../lib/motion'
import * as THREE from 'three'

/*
 * A quiet Three.js dot-field — a grid of ink points that breathe with a slow
 * wave and drift a few pixels toward the pointer. Decorative only: it renders
 * nothing under prefers-reduced-motion, and pauses when the tab is hidden.
 */
export default function AmbientField({ isDark = false, density = 34, opacity = 0.3, className = '' }) {
  const mount = useRef(null)
  const materialRef = useRef(null)

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(isDark ? '#f4f3f0' : '#101010')
    }
  }, [isDark])

  useEffect(() => {
    const el = mount.current
    if (!el) return
    if (!motionOK()) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.z = 20
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'

    // Round dot sprite so points render as circles, not squares
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')
    g.beginPath()
    g.arc(32, 32, 26, 0, Math.PI * 2)
    g.fillStyle = '#fff'
    g.fill()
    const sprite = new THREE.CanvasTexture(c)

    const material = new THREE.PointsMaterial({
      size: 0.14,
      map: sprite,
      transparent: true,
      opacity,
      alphaTest: 0.4,
      color: isDark ? '#f4f3f0' : '#101010',
      depthWrite: false,
    })
    materialRef.current = material

    let points = null
    let base = null

    function buildGrid() {
      const w = el.clientWidth || 1
      const h = el.clientHeight || 1
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)

      const visH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360)
      const visW = visH * camera.aspect
      const cols = density
      const rows = Math.max(6, Math.round(density * (h / w)))
      const n = cols * rows
      const pos = new Float32Array(n * 3)
      base = new Float32Array(n * 3)
      let i = 0
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = (x / (cols - 1) - 0.5) * visW
          const py = (y / (rows - 1) - 0.5) * visH
          pos[i * 3] = px
          pos[i * 3 + 1] = py
          pos[i * 3 + 2] = 0
          base[i * 3] = px
          base[i * 3 + 1] = py
          base[i * 3 + 2] = 0
          i++
        }
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      if (points) {
        points.geometry.dispose()
        points.geometry = geo
      } else {
        points = new THREE.Points(geo, material)
        scene.add(points)
      }
    }

    buildGrid()
    const ro = new ResizeObserver(buildGrid)
    ro.observe(el)

    // Pointer parallax — everything settles, nothing bounces
    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }
    function onPointer(e) {
      const r = el.getBoundingClientRect()
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 0.8
      target.y = -((e.clientY - r.top) / r.height - 0.5) * 0.8
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    let raf = null
    let hidden = false
    const clock = new THREE.Clock()
    function frame() {
      raf = requestAnimationFrame(frame)
      if (hidden || !points) return
      const t = clock.getElapsedTime()
      const attr = points.geometry.getAttribute('position')
      for (let i = 0; i < attr.count; i++) {
        const bx = base[i * 3]
        const by = base[i * 3 + 1]
        attr.array[i * 3 + 2] = Math.sin(t * 0.5 + bx * 0.35 + by * 0.22) * 0.5
      }
      attr.needsUpdate = true
      eased.x += (target.x - eased.x) * 0.03
      eased.y += (target.y - eased.y) * 0.03
      points.position.x = eased.x
      points.position.y = eased.y
      renderer.render(scene, camera)
    }
    frame()

    function onVisibility() {
      hidden = document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
      ro.disconnect()
      if (points) {
        points.geometry.dispose()
        scene.remove(points)
      }
      material.dispose()
      sprite.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
      materialRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={mount}
      aria-hidden="true"
      className={`pointer-events-none absolute overflow-hidden ${className}`}
    />
  )
}
