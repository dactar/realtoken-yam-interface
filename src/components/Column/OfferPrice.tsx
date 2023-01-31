import { Skeleton, Text } from "@mantine/core"
import BigNumber from "bignumber.js";
import { useMemo } from "react";
import { useOfferPriceInDollar } from "src/hooks/useOfferPriceInDollar";
import { useOraclePriceFeed } from "src/hooks/useOraclePriceFeed";
import { usePropertyToken } from "src/hooks/usePropertyToken";
import { Offer, OFFER_TYPE } from "src/types/offer"
import { getPropertyTokenAddress } from "src/utils/properties";

interface OfferPriceProps{
    offer: Offer
}
export const OfferPrice = ({ offer } : OfferPriceProps) => {

    const { propertyToken } = usePropertyToken(getPropertyTokenAddress(offer));
    const { price } = useOraclePriceFeed(offer.type == OFFER_TYPE.BUY ? offer.offerTokenAddress: offer.buyerTokenAddress);

    const originalPrice = propertyToken?.officialPrice;
    const offerPrice = offer.price;

    const { tokenPriceInDollar } = useOfferPriceInDollar(price, offer);

    const offerPriceDelta: BigNumber|undefined = useMemo(() => {
        if(!originalPrice || !propertyToken || !tokenPriceInDollar) return undefined;

        const originalYield = propertyToken.annualYield;
        return originalYield ? tokenPriceInDollar.multipliedBy(new BigNumber(1)).dividedBy(new BigNumber(originalPrice)).minus(1) : undefined;

    },[originalPrice, propertyToken, tokenPriceInDollar]);

    const isZero: boolean|undefined = useMemo(() => {
        if(!offerPriceDelta) return undefined;
        const valueFloat = Math.abs(parseFloat(offerPriceDelta.toString())*100).toFixed(0);
        console.log(valueFloat)
        return valueFloat == "0"
    },[offerPriceDelta]);

    return(
        <Text
            size={'sm'}
            sx={{
            textAlign: 'center',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            }}
        >
            <Text>{`${offerPrice} ($${parseFloat(tokenPriceInDollar ? tokenPriceInDollar?.toString() : "0").toFixed(2)})`}</Text>
            {   
                !offerPriceDelta && isZero == undefined ?
                    <Skeleton height={15}/>
                : offerPriceDelta && !isZero ?
                    <Text color={offerPriceDelta.gt(0) ? "red" : "green"}>
                        {`(${offerPriceDelta.gt(0) ? "+" : ""}${parseFloat(offerPriceDelta.multipliedBy(100).toString()).toFixed(2)}%)`}
                    </Text>
                :
                    undefined
            }
        </Text>
    )
}