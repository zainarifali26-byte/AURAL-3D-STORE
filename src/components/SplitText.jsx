import { Fragment } from 'react';

// Renders a headline as words wrapped in clipping spans so useScrollMotion
// can raise them one by one. Spaces live between the spans (inside a clipped
// inline-block they would collapse). Screen readers get the plain text.
export default function SplitText({ as: Tag = 'h2', text, className, delay, id }) {
  const words = text.split(' ');
  return (
    <Tag className={className} id={id} data-split="" data-delay={delay} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="w" aria-hidden="true">
            <span className="w-in">{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
