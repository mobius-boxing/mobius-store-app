import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { CartLine, CartValidation, ItemType } from '../types';
import { STORAGE_KEYS } from '../services/api';

const MAX_BOX_MEASURES = 8;

interface CartContextType {
  lines: CartLine[];
  addOrUpdate: (line: CartLine) => void;
  setQuantity: (itemType: ItemType, sourceUuid: string, quantity: number) => void;
  remove: (itemType: ItemType, sourceUuid: string) => void;
  clear: () => void;
  getLine: (itemType: ItemType, sourceUuid: string) => CartLine | undefined;
  distinctBoxCount: number;
  totalLines: number;
  validation: CartValidation;
  isValid: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const keyOf = (itemType: ItemType, sourceUuid: string) => `${itemType}:${sourceUuid}`;

const isPositiveInt = (n: number) => Number.isInteger(n) && n > 0;

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.cart);
      return cached ? (JSON.parse(cached) as CartLine[]) : [];
    } catch {
      return [];
    }
  });

  // Persist cart so a mid-build refresh doesn't lose it.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(lines));
    } catch {
      /* ignore quota errors */
    }
  }, [lines]);

  const getLine = useCallback(
    (itemType: ItemType, sourceUuid: string) =>
      lines.find((l) => l.itemType === itemType && l.sourceUuid === sourceUuid),
    [lines]
  );

  const addOrUpdate = useCallback((line: CartLine) => {
    setLines((prev) => {
      const idx = prev.findIndex(
        (l) => l.itemType === line.itemType && l.sourceUuid === line.sourceUuid
      );
      if (idx === -1) return [...prev, line];
      const next = [...prev];
      next[idx] = { ...next[idx], ...line };
      return next;
    });
  }, []);

  const setQuantity = useCallback(
    (itemType: ItemType, sourceUuid: string, quantity: number) => {
      setLines((prev) =>
        prev.map((l) =>
          l.itemType === itemType && l.sourceUuid === sourceUuid ? { ...l, quantity } : l
        )
      );
    },
    []
  );

  const remove = useCallback((itemType: ItemType, sourceUuid: string) => {
    setLines((prev) =>
      prev.filter((l) => !(l.itemType === itemType && l.sourceUuid === sourceUuid))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const distinctBoxCount = useMemo(
    () => lines.filter((l) => l.itemType === 'box').length,
    [lines]
  );

  const totalLines = lines.length;

  // Derived per-line + global validation (UX only; server is source of truth).
  const validation = useMemo<CartValidation>(() => {
    const lineValidation: CartValidation['lines'] = {};

    for (const line of lines) {
      const k = keyOf(line.itemType, line.sourceUuid);

      if (!isPositiveInt(line.quantity)) {
        lineValidation[k] = { valid: false, errorKey: 'cart.validation.positiveInt' };
        continue;
      }

      if (line.itemType === 'box') {
        const min = (line.unitsPerPallet ?? 0) * 2;
        if (line.quantity < min) {
          lineValidation[k] = {
            valid: false,
            errorKey: 'cart.validation.boxMin',
            errorParams: { min },
          };
          continue;
        }
      } else {
        const min = line.minQuantity ?? 0;
        if (line.quantity < min) {
          lineValidation[k] = {
            valid: false,
            errorKey: 'cart.validation.rollMin',
            errorParams: { min },
          };
          continue;
        }
      }

      lineValidation[k] = { valid: true };
    }

    return {
      lines: lineValidation,
      maxBoxMeasuresExceeded: distinctBoxCount > MAX_BOX_MEASURES,
    };
  }, [lines, distinctBoxCount]);

  const isValid = useMemo(() => {
    if (lines.length === 0) return false;
    if (validation.maxBoxMeasuresExceeded) return false;
    return Object.values(validation.lines).every((v) => v.valid);
  }, [lines.length, validation]);

  const value: CartContextType = {
    lines,
    addOrUpdate,
    setQuantity,
    remove,
    clear,
    getLine,
    distinctBoxCount,
    totalLines,
    validation,
    isValid,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export { MAX_BOX_MEASURES };
