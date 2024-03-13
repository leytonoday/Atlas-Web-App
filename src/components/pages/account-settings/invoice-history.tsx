import {
  FormattedPrice,
  IconPopover,
  SimpleTooltip,
} from "@/components/common";
import { useApiQuery, useIsMobileScreen } from "@/hooks";
import { services } from "@/services";
import { IStripeSlimInvoice } from "@/types";
import { Card, Result, Spin, Timeline } from "antd";
import { TimelineItemProps } from "antd/lib";
import { useCallback, useMemo } from "react";
import {
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineExclamationCircle,
  AiOutlineFileText,
  AiOutlineMinusCircle,
} from "react-icons/ai";
import dateFormat from "dateformat";

/**
 * Displays a list of the user's invoice history.
 */
export const InvoiceHistory = () => {
  const isMobileScreen = useIsMobileScreen();

  // Get My Invoice History
  const { data: invoiceHistory, isLoading: isInvoiceHistoryLoading } =
    useApiQuery<IStripeSlimInvoice[]>({
      queryKey: ["myInvoiceHistory"],
      queryFn: () =>
        services.api.stripe.getMyInvoiceHistory({
          limit: 100,
        }),
    });

  /**
   * Opens the invoice PDF in a new tab.
   */
  const openInvoicePdf = useCallback((url: string) => {
    window.open(url);
  }, []);

  /**
   * Converts a Stripe invoice status to a TimelineItem dot. For example,
   * "paid" becomes a green checkmark, "unpaid" becomes a red exclamation mark, etc.
   */
  const stripeInvoiceStatusToTimelineItemDot = useCallback((status: string) => {
    switch (status) {
      case "paid":
        return (
          <SimpleTooltip text="Paid">
            <AiOutlineCheckCircle className="text-xl" color="green" />
          </SimpleTooltip>
        );
      case "draft":
        return (
          <SimpleTooltip text="Draft">
            <AiOutlineMinusCircle className="text-xl" color="blue" />
          </SimpleTooltip>
        );
      case "open":
        return (
          <SimpleTooltip text="Open">
            <AiOutlineMinusCircle className="text-xl" color="blue" />
          </SimpleTooltip>
        );
      case "uncollectible":
        return (
          <SimpleTooltip text="Uncollectable">
            <AiOutlineExclamationCircle className="text-xl" color="red" />
          </SimpleTooltip>
        );
      case "void":
        return (
          <SimpleTooltip text="Void">
            <AiOutlineCloseCircle className="text-xl" color="grey" />
          </SimpleTooltip>
        );
      default:
        return (
          <SimpleTooltip text="Unknown">
            <AiOutlineExclamationCircle className="text-xl" color="grey" />
          </SimpleTooltip>
        );
    }
  }, []);

  /**
   * Converts Stripe invoices to Timeline items.
   */
  const timelineItems = useMemo<TimelineItemProps[]>(
    () =>
      (invoiceHistory || [])?.map((invoice) => ({
        dot: stripeInvoiceStatusToTimelineItemDot(invoice.status),
        children: (
          <div className="flex flex-col gap-1">
            {/* The Date and File icon */}
            <div className="flex items-center gap-2">
              <div>{dateFormat(invoice.created, "dd/mm/yyyy")}</div>
              <div className="flex items-center">
                <SimpleTooltip text="See invoice and receipt">
                  <AiOutlineFileText
                    className="cursor-pointer text-xl"
                    onClick={() => openInvoicePdf(invoice.hostedInvoiceUrl)}
                  />
                </SimpleTooltip>
              </div>
            </div>

            {/* The amount and refund info */}
            <div className="flex items-center gap-2">
              <FormattedPrice
                amount={invoice.total}
                currency={invoice.currency.toUpperCase()}
              />
              {invoice.total < 0 && (
                <IconPopover status="info" content="This amount was refunded" />
              )}
            </div>
          </div>
        ),
      })),
    [invoiceHistory],
  );

  // If there are no invoices, show a loading spinner or a message saying there are no invoices.
  if (!isInvoiceHistoryLoading && !invoiceHistory?.length)
    return (
      <Result
        title="No invoice history"
        subTitle="You have not subscribed to anything yet, and thus have no invoice history."
        status="info"
      />
    );

  return (
    <Card
      size={isMobileScreen ? "small" : "default"}
      className="w-full"
      title="Invoice History"
    >
      <div className="md:p8 max-h-[20rem] overflow-y-auto p-2">
        <Spin spinning={isInvoiceHistoryLoading}>
          <Timeline mode="left" items={timelineItems} />
        </Spin>
      </div>
    </Card>
  );
};
