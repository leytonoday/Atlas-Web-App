/**
 * A common interface for React components that wrap other React components.
 */
export interface IWrapperComponentProps {
  /**
   * The content of the component.
   */
  children: React.ReactNode;

  /**
   * Optional class names that will be merged with the default class names.
   */
  className?: string;
}
