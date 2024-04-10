import { Carousel, Button } from "antd";
import styles from "./simple-carousel.module.css";
import { useEffect, useRef, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { SimpleTooltip } from "../simple-tooltip";
import Image from "next/image";
import { Heading } from "../heading";
import { cn } from "@/utils";

export interface ISimpleCarouseSlide {
  /**
   * The image url
   */
  url: string;

  /**
   * The image width
   */
  width: number;

  /**
   * The image height
   */
  height: number;

  /**
   * The image alt text
   */
  alt: string;

  /**
   * The slide title (optional)
   */
  title?: string;

  /**
   * The slide description (optional)
   */
  description?: string | React.ReactNode;
}

interface ISimpleCarouselProps {
  /**
   * The images to display
   */
  slides: ISimpleCarouseSlide[];

  /**
   * Whether to scale the images on hover
   */
  scaleOnHover?: boolean;

  /**
   * Whether to show the arrows
   */
  showArrows?: boolean;

  /**
   * The class name
   */
  className?: string;

  /**
   * Whether to autoplay the carousel
   */
  autoplay?: boolean;
}

export const SimpleCarousel = (props: ISimpleCarouselProps) => {
  const ref = useRef<any>(null);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const currentSlide: ISimpleCarouseSlide | null =
    props.slides[currentSlideIndex] || null;

  const hasDescriptionOrTitle =
    currentSlide?.description || currentSlide?.title;

  // Reset the carousel to the first slide when the component mounts
  useEffect(() => {
    if (ref.current) {
      ref.current.goTo(0, true);
    }
  }, [ref.current, props.slides]);

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div
        className={cn("w-full", {
          "md:w-3/5": hasDescriptionOrTitle,
          "md:w-full": !hasDescriptionOrTitle,
        })}
      >
        <Carousel
          autoplay={props.autoplay === undefined ? true : props.autoplay}
          className={cn(
            props.scaleOnHover ? styles.carousel : undefined,
            props.className,
          )}
          effect="fade"
          ref={ref}
          beforeChange={(_, next) => setCurrentSlideIndex(next)}
        >
          {props.slides.map((slide, i) => (
            <div key={i} className="h-auto w-full">
              <Image
                src={slide.url}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                className={cn(styles.image, "h-auto w-full")}
              />
            </div>
          ))}
        </Carousel>
        {props.showArrows && (
          <div className="mt-2 flex justify-between px-4">
            <SimpleTooltip text="Previous">
              <Button
                onClick={() => ref.current.prev()}
                shape="circle"
                className="flex items-center justify-center"
                aria-label="Go to previous image"
              >
                <AiOutlineArrowLeft />
              </Button>
            </SimpleTooltip>

            <SimpleTooltip text="Next">
              <Button
                onClick={() => ref.current.next()}
                shape="circle"
                className="flex items-center justify-center"
                aria-label="Go to next image"
              >
                <AiOutlineArrowRight />
              </Button>
            </SimpleTooltip>
          </div>
        )}
      </div>

      {hasDescriptionOrTitle && (
        <div className="w-full md:w-2/5">
          {currentSlide?.title && (
            <Heading level={3} className="mt-2 text-center md:text-start">
              {currentSlide.title}
            </Heading>
          )}
          {currentSlide?.description && (
            <div className="mt-2 text-start lg:text-lg">
              {currentSlide.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
