import { Component, type ReactNode } from 'react'
import { modelosNoDisponiblesCopy } from '../lib/error-copy'
import { Gradiente3d } from './gradiente-3d'

export interface Modelo3DFallbackProps {
  message?: string
  className?: string
  children: ReactNode
}

interface Modelo3DFallbackState {
  roto: boolean
}

export class Modelo3DFallback extends Component<Modelo3DFallbackProps, Modelo3DFallbackState> {
  state: Modelo3DFallbackState = { roto: false }

  static getDerivedStateFromError(): Modelo3DFallbackState {
    return { roto: true }
  }

  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) {
      console.error('No se pudo construir el modelo 3D de la cama o el sofá.', error)
    }
  }

  render() {
    if (this.state.roto) {
      return (
        <Gradiente3d message={this.props.message ?? modelosNoDisponiblesCopy} className={this.props.className} />
      )
    }
    return this.props.children
  }
}