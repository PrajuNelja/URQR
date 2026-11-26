// src/components/Keyboard/VirtualKeyboard.tsx
import React, { useState } from "react";
import { Delete, ChevronUp, Keyboard } from "lucide-react";

const QWERTY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const NUMBERS_ROW_1 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const NUMBERS_ROW_2 = ["-", "/", ":", ";", "(", ")", "₹", "&", "@", '"'];
const NUMBERS_ROW_3 = [".", ",", "?", "!", "'", "[", "]", "{", "}"];

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onEnter?: () => void;
  onBackspace?: () => void;
  onClear?: () => void;
  isOpen?: boolean;
  className?: string;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onEnter,
  onBackspace,
  onClear,
  isOpen = true,
  className = "",
}) => {
  const [isShift, setIsShift] = useState(false);
  const [isNumeric, setIsNumeric] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyAction = (key: string, action?: () => void) => {
    setActiveKey(key);
    if (action) action();
    else onKeyPress(isShift ? key.toUpperCase() : key.toLowerCase());
    
    setTimeout(() => setActiveKey(null), 150);
  };

  // NO SHADOW on base keys, just border
  const keyBase = "flex items-center justify-center rounded-lg border border-[#E5E1D8] bg-[#F8F6F0] text-primary font-sans font-semibold transition-all duration-150";
  
  // Highlight state (border change and scale)
  const keyActive = "border-accent-gold bg-[#EBE7DF] scale-95";

  const keyChar = (key: string) => `${keyBase} flex-1 min-w-[32px] h-[46px] text-sm hover:bg-[#EBE7DF] ${activeKey === key ? keyActive : ""}`;
  const keySpecial = (key: string, width: string) => `${keyBase} ${width} h-[46px] text-text-muted hover:text-primary hover:bg-[#EBE7DF] ${activeKey === key ? keyActive : ""}`;
  
  // NO SHADOW on the done button
  const keyAction = (key: string) => `flex items-center justify-center rounded-lg bg-[#7A4E25] text-white font-sans font-semibold transition-all duration-150 h-[46px] ${activeKey === key ? "scale-95 brightness-90" : "hover:bg-[#68411E]"}`;

  return (
    // NO SHADOW on the main keyboard wrapper
    <div className={`w-full bg-surface mx-0 my-0 border rounded-xl p-3  ${className}`}>
      <div className="w-full flex flex-col gap-1.5">
        
        {/* LETTERS LAYOUT */}
        {!isNumeric && (
          <>
            <div className="flex justify-center gap-1.5">
              {QWERTY_ROWS[0].map((char) => (
                <button key={char} type="button" onClick={() => handleKeyAction(char)} className={keyChar(char)}>
                  {char.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 px-5">
              {QWERTY_ROWS[1].map((char) => (
                <button key={char} type="button" onClick={() => handleKeyAction(char)} className={keyChar(char)}>
                  {char.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-1.5">
              <button
                type="button"
                onClick={() => handleKeyAction("shift", () => setIsShift(!isShift))}
                className={`${keySpecial("shift", "w-[60px]")} ${isShift ? "bg-accent-gold/20 border-accent-gold text-primary" : ""}`}
              >
                <ChevronUp size={20} className={isShift ? "fill-primary" : ""} />
              </button>

              {QWERTY_ROWS[2].map((char) => (
                <button key={char} type="button" onClick={() => handleKeyAction(char)} className={keyChar(char)}>
                  {char.toUpperCase()}
                </button>
              ))}

              <button 
                type="button" 
                onClick={() => handleKeyAction("backspace", onBackspace)} 
                className={`${keySpecial("backspace", "w-[60px]")}`}
              >
                <Delete size={20} />
              </button>
            </div>

            <div className="flex justify-center gap-1.5 mt-0.5">
              {onClear && (
                <button
                  type="button"
                  onClick={() => handleKeyAction("clear", onClear)}
                  className={`${keySpecial("clear", "w-[50px]")} text-xs`}
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={() => handleKeyAction("123", () => setIsNumeric(true))}
                className={`${keySpecial("123", "w-[65px]")} text-xs`}
              >
                123 / @#
              </button>

              <button type="button" onClick={() => handleKeyAction(",")} className={`${keySpecial(",", "w-[36px]")} text-base`}>
                ,
              </button>

              <button type="button" onClick={() => handleKeyAction("space")} className={`${keyChar("space")} flex-[2]`}>
                Space
              </button>

              <button type="button" onClick={() => handleKeyAction(".")} className={`${keySpecial(".", "w-[36px]")} text-base`}>
                .
              </button>

              <button 
                type="button" 
                onClick={() => handleKeyAction("enter", onEnter)} 
                className={`${keyAction("enter")} w-[160px] gap-1.5`}
              >
                <Keyboard size={16} />
                <span className="text-[11px]">Done / Hide Keyboard</span>
              </button>
            </div>
          </>
        )}

        {/* NUMBERS / SYMBOLS LAYOUT */}
        {isNumeric && (
          <>
            <div className="flex justify-center gap-1.5">
              {NUMBERS_ROW_1.map((char) => (
                <button key={char} type="button" onClick={() => handleKeyAction(char)} className={keyChar(char)}>
                  {char}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 px-5">
              {NUMBERS_ROW_2.map((char) => (
                <button key={char} type="button" onClick={() => handleKeyAction(char)} className={keyChar(char)}>
                  {char}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-1.5">
              <button 
                type="button" 
                onClick={() => handleKeyAction("abc", () => setIsNumeric(false))} 
                className={`${keySpecial("abc", "w-[65px]")} text-xs`}
              >
                ABC
              </button>
              
              {NUMBERS_ROW_3.map((char) => (
                <button key={char} type="button" onClick={() => handleKeyAction(char)} className={keyChar(char)}>
                  {char}
                </button>
              ))}

              <button 
                type="button" 
                onClick={() => handleKeyAction("backspace", onBackspace)} 
                className={`${keySpecial("backspace", "w-[60px]")}`}
              >
                <Delete size={20} />
              </button>
            </div>

            <div className="flex justify-center gap-1.5 mt-0.5">
              <button type="button" onClick={() => handleKeyAction(",")} className={`${keySpecial(",", "w-[36px]")} text-base`}>
                ,
              </button>

              <button type="button" onClick={() => handleKeyAction("space")} className={`${keyChar("space")} flex-[2]`}>
                Space
              </button>

              <button type="button" onClick={() => handleKeyAction(".")} className={`${keySpecial(".", "w-[36px]")} text-base`}>
                .
              </button>

              <button 
                type="button" 
                onClick={() => handleKeyAction("enter", onEnter)} 
                className={`${keyAction("enter")} w-[160px] gap-1.5`}
              >
                <Keyboard size={16} />
                <span className="text-[11px]">Done / Hide Keyboard</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default VirtualKeyboard;