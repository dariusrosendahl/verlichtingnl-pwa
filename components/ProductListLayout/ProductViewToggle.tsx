import { IconSvg } from '@graphcommerce/next-ui'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useEffect, useState } from 'react'

// Grid icon (4 squares)
const iconGrid = (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
    <rect x='3' y='3' width='8' height='8' rx='1' />
    <rect x='13' y='3' width='8' height='8' rx='1' />
    <rect x='3' y='13' width='8' height='8' rx='1' />
    <rect x='13' y='13' width='8' height='8' rx='1' />
  </svg>
)

// List icon (horizontal lines)
const iconList = (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <line x1='3' y1='6' x2='21' y2='6' />
    <line x1='3' y1='12' x2='21' y2='12' />
    <line x1='3' y1='18' x2='21' y2='18' />
  </svg>
)

export type ProductViewMode = 'grid' | 'list'

const STORAGE_KEY = 'productViewMode'

export function useProductViewMode() {
  const [viewMode, setViewMode] = useState<ProductViewMode>('grid')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'grid' || stored === 'list') {
      setViewMode(stored)
    }
  }, [])

  const handleViewModeChange = (mode: ProductViewMode) => {
    setViewMode(mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }

  return { viewMode, setViewMode: handleViewModeChange }
}

type ProductViewToggleProps = {
  viewMode: ProductViewMode
  onChange: (mode: ProductViewMode) => void
}

export function ProductViewToggle({ viewMode, onChange }: ProductViewToggleProps) {
  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={(_, newMode) => {
        if (newMode !== null) {
          onChange(newMode)
        }
      }}
      size='small'
      sx={{
        '& .MuiToggleButton-root': {
          border: '1px solid',
          borderColor: 'divider',
          px: 1,
          py: 0.5,
          '&.Mui-selected': {
            backgroundColor: 'action.selected',
            borderColor: 'primary.main',
          },
        },
      }}
    >
      <ToggleButton value='grid' aria-label='Grid view'>
        {iconGrid}
      </ToggleButton>
      <ToggleButton value='list' aria-label='List view'>
        {iconList}
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
