import { InlineMath, BlockMath } from "react-katex";

interface LatexRendererProps {
  content: string;
  className?: string;
}

export function LatexRenderer({ content, className = "" }: LatexRendererProps) {
  // Split content by LaTeX patterns and render accordingly
  const renderContent = (text: string) => {
    // Split by block math ($$...$$)
    const blockParts = text.split(/(\$\$[^$]+\$\$)/g);
    
    return blockParts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const math = part.slice(2, -2);
        return <BlockMath key={index} math={math} />;
      } else {
        // Check for inline math ($...$) in this part
        const inlineParts = part.split(/(\$[^$]+\$)/g);
        return inlineParts.map((inlinePart, inlineIndex) => {
          if (inlinePart.startsWith('$') && inlinePart.endsWith('$') && inlinePart.length > 2) {
            // Inline math
            const math = inlinePart.slice(1, -1);
            return <InlineMath key={`${index}-${inlineIndex}`} math={math} />;
          } else {
            // Regular text - preserve line breaks
            return (
              <span key={`${index}-${inlineIndex}`}>
                {inlinePart.split('\n').map((line, lineIndex, array) => (
                  <span key={lineIndex}>
                    {line}
                    {lineIndex < array.length - 1 && <br />}
                  </span>
                ))}
              </span>
            );
          }
        });
      }
    });
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {renderContent(content)}
    </div>
  );
}