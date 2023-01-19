import { useNavigate } from "@shopify/app-bridge-react";
import {
  Button,
  Card,
  Icon,
  IndexTable,
  Stack,
  TextStyle,
  Thumbnail,
  UnstyledLink,
  Banner,
} from "@shopify/polaris";
import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";

/* useMedia is used to support multiple screen sizes */
import { useMedia } from "@shopify/react-hooks";
import { useAuthenticatedFetch } from "../hooks";

/* dayjs is used to capture and format the date a QR code was created or modified */
import dayjs from "dayjs";
import { useState,useCallback } from "react";

/* Markup for small screen sizes (mobile) */
function SmallScreenCard({
  _id,
  title,
  product_img,
  discountCode,
  scans,
  createdAt,
}) {
  return (
      <div
        style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E1E3E5" }}
      >
        <Stack>
          <Stack.Item>
            <Thumbnail
              source={product_img || ImageMajor}
              alt="placeholder"
              color="base"
              size="small"
            />
          </Stack.Item>
          <Stack.Item fill>
            <Stack vertical={true}>
              <Stack.Item>
                <p>
                  <TextStyle variation="strong">
                    {truncate(title, 35)}
                  </TextStyle>
                </p>
                <p>{truncate(title, 35)}</p>
                <p>{dayjs(createdAt).format("MMMM D, YYYY")}</p>
              </Stack.Item>
              {/* <div style={{ display: "flex" }}>
                <div style={{ flex: "3" }}>
                  <TextStyle variation="subdued">Discount</TextStyle>
                  <p>{discountCode || "-"}</p>
                </div>
                <div style={{ flex: "2" }}>
                  <TextStyle variation="subdued">Scans</TextStyle>
                  <p>{scans}</p>
                </div>
              </div> */}
            </Stack>
          </Stack.Item>
        </Stack>
      </div>
  );
}

export function QRCodeIndex({ QRCodes: InitialQRCode, loading }) {

const [successBanner, setSuccessBanner] = useState(false);
const [errorBanner, setErrorBanner] = useState(false);
const [QRCodes, setQRCodes] = useState(InitialQRCode);
const fetch = useAuthenticatedFetch();
  
 const Add = useCallback((id) => {
  (async () => {
    const senddata = {
      "productData": {
          "id": id
      }
  }
  const url = "https://api.theprintribe.com/api/shopify/addProducts";
  const method = "POST";
    const response = await fetch(url, {
      method,
      body: JSON.stringify(senddata),
      headers: { "Content-Type": "application/json" },
    });
    if(response.ok)
    {
      setSuccessBanner(true);
    }
  })();
  return { status: "success" }; 
 })

 const Remove = useCallback((id) => {
  (async () => {
    const senddata = {
      "productData": {
          "id": id
      }
  }
  const url = "https://api.theprintribe.com/api/shopify/removeProduct";
  const method = "POST";
    const response = await fetch(url, {
      method,
      body: JSON.stringify(senddata),
      headers: { "Content-Type": "application/json" },
    });
    if(response.ok)
    {
      setErrorBanner(true);
    }
  })();
  return { staus: "success" }
 }, [QRCodes, setQRCodes]
 )

  /* Check if screen is small */
  const isSmallScreen = useMedia("(max-width: 640px)");

  /* Map over QRCodes for small screen */
  const smallScreenMarkup = QRCodes.map((QRCode) => (
    <SmallScreenCard key={QRCode._id} {...QRCode} />
  ));

  const resourceName = {
    singular: "Product",
    plural: "Products",
  };

  const rowMarkup = QRCodes.map(
    ({ _id, title, product_img, product_id, discountCode, scans, createdAt, shopify_prod }, index) => {
      const deletedProduct = title.includes("Deleted product");

      /* The form layout, created using Polaris components. Includes the QR code data set above. */
      return (
        <IndexTable.Row
          id={_id}
          key={_id}
          position={index}
        >
          <IndexTable.Cell>
            <Thumbnail
              source={product_img || ImageMajor}
              alt="placeholder"
              color="base"
              size="small"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
              {truncate(title, 25)}
          </IndexTable.Cell>
          {/* <IndexTable.Cell>
            <Stack>
              {deletedProduct && (
                <Icon source={DiamondAlertMajor} color="critical" />
              )}
              <TextStyle variation={deletedProduct ? "negative" : null}>
                {truncate(title, 25)}
              </TextStyle>
            </Stack>
          </IndexTable.Cell> */}
          {/* <IndexTable.Cell>{discountCode}</IndexTable.Cell> */}
          <IndexTable.Cell>
            {dayjs(createdAt).format("MMMM D, YYYY")}
          </IndexTable.Cell>
          <IndexTable.Cell>
                {(shopify_prod && shopify_prod == "yes")? <Button onClick={() =>Remove(product_id)}>Remove</Button> : <Button onClick={() =>Add(product_id)}>Add</Button>}
          </IndexTable.Cell>
          {/* <IndexTable.Cell>{scans}</IndexTable.Cell> */}
        </IndexTable.Row>
      );
    }
  );

  /* A layout for small screens, built using Polaris components */
  return (
    <Card>

    {successBanner ? (<Banner
      title="Your product was added"
      status="success"
      onDismiss={() => {window.location.reload(false);}}
    />): null}
    {errorBanner ? (<Banner
      title="Your product was removed"
      status="success"
      onDismiss={() => {window.location.reload(false);}}
    />): null}
      {isSmallScreen ? (
        smallScreenMarkup
      ) : (
        <IndexTable
          resourceName={resourceName}
          itemCount={QRCodes.length}
          headings={[
            { title: "Thumbnail", hidden: true },
            { title: "Title" },
            { title: "Date created" },
            {title: "action"},
          ]}
          selectable={false}
          loading={loading}
        >
          {rowMarkup}
        </IndexTable>
      )}
    </Card>
  );
}

/* A function to truncate long strings */
function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}
