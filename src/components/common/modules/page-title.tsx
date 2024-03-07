import { Heading } from "./heading";

interface IPageTitleProps {
  /**
   * The title of the page.
   */
  title: string | React.ReactNode;

  /**
   * The subtitle of the page.
   */
  subtitle?: string | React.ReactNode;
}

/**
 * Component used for page titles. Renders a title and subtitle and adds margin to the bottom, so that the page content can be immediately below.
 */
export const PageTitle = (props: IPageTitleProps) => (
  <div className="mb-8">
    <Heading level={1} className="text-center">
      {props.title}
    </Heading>
    {props.subtitle && (
      <div className="-mt-2 text-center">{props.subtitle}</div>
    )}
  </div>
);
