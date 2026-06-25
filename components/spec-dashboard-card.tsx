'use client'

import { useEffect, useState } from 'react'
import { Cpu, Thermometer, MemoryStick, Activity } from 'lucide-react'
import { TiltCard } from '@/components/tilt-card'

function Meter({
  icon: Icon,
  label,
  value,
  unit,
  target,
  depth,
}: {
  icon: typeof Cpu
  label: string
  value: number
  unit: string
  target: number
  depth: number
}) {
  return (
    <div
      className="rounded-xl border border-white/15 bg-white/5 p-4"
      style={{ transform: `translateZ(${depth}px)` }}
    >
      <div className="flex items-center justify-between text-white/80">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon size={16} className="text-blue-200" />
          {label}
        </span>
        <span className="font-mono text-sm font-semibold text-white">
          {value}
          {unit}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-200 to-white transition-all duration-700 ease-out"
          style={{ width: `${target}%` }}
        />
      </div>
    </div>
  )
}

export function SpecDashboardCard() {
  const [cpu, setCpu] = useState(42)
  const [gpu, setGpu] = useState(61)
  const [ram, setRam] = useState(58)

  useEffect(() => {
    const id = setInterval(() => {
      setCpu(30 + Math.round(Math.random() * 55))
      setGpu(45 + Math.round(Math.random() * 45))
      setRam(50 + Math.round(Math.random() * 35))
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <TiltCard
      max={14}
      className="w-full max-w-md rounded-3xl glass-blue p-6 shadow-blue-lg"
    >
      <div
        className="flex items-center justify-between"
        style={{ transform: 'translateZ(40px)' }}
      >
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-blue-200">
            System Monitor
          </p>
          <h3 className="mt-1 font-heading text-xl font-bold text-white">
            JK Build · Live
          </h3>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-medium text-emerald-200">
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-emerald-300" />
          Online
        </span>
      </div>

      <div className="mt-6 space-y-3">
        <Meter icon={Cpu} label="CPU Usage" value={cpu} unit="%" target={cpu} depth={30} />
        <Meter
          icon={Thermometer}
          label="GPU Temp"
          value={52 + Math.round(gpu / 4)}
          unit="°C"
          target={gpu}
          depth={20}
        />
        <Meter
          icon={MemoryStick}
          label="RAM Usage"
          value={ram}
          unit="%"
          target={ram}
          depth={30}
        />
      </div>

      <div
        className="mt-6 flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-3"
        style={{ transform: 'translateZ(35px)' }}
      >
        <span className="flex items-center gap-2 text-sm text-white/80">
          <Activity size={16} className="text-blue-200" />
          Performance
        </span>
        <span className="font-heading text-lg font-bold text-white">Optimal</span>
      </div>
    </TiltCard>
  )
}
