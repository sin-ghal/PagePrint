import UploadForm from "./UploadForm"

interface Shop {
  shopName: string
  shopAddress: string
  phone?: string
  ownerName?: string
}

async function getShop(shopSlug: string): Promise<Shop | null> {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"
  try {
    const res = await fetch(`${base}/api/v1/customer/shop/${shopSlug}`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.success ? data.shop : null
  } catch {
    return null
  }
}

export default async function ShopPage({ params }: { params: Promise<{ shopSlug: string }> }) {
  const { shopSlug } = await params
  const shop = await getShop(shopSlug)

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="text-center">
          <p className="text-5xl mb-4">❌</p>
          <p className="text-xl font-bold" style={{ color: "#1a1a2e" }}>Shop not found</p>
          <p className="text-sm mt-2" style={{ color: "#6b7280" }}>This QR code may be invalid</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="text-center py-8 px-6" style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <span className="text-3xl">🖨️</span>
        <h1 className="text-2xl font-bold mt-2" style={{ color: "#1a1a2e" }}>{shop.shopName}</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>📍 {shop.shopAddress}</p>
        {shop.phone && <p className="text-sm mt-1" style={{ color: "#6b7280" }}>📞 {shop.phone}</p>}
        {shop.ownerName && <p className="text-sm mt-1" style={{ color: "#6b7280" }}>👤 {shop.ownerName}</p>}
        <p className="text-sm mt-3 font-medium" style={{ color: "#c0392b" }}>Upload your documents below</p>
      </div>

      <UploadForm shopSlug={shopSlug} shop={shop} />
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ shopSlug: string }> }) {
  const { shopSlug } = await params
  const shop = await getShop(shopSlug)
  return {
    title: shop ? `${shop.shopName} — PagePrint` : "Shop — PagePrint",
    description: shop ? `Upload and print your documents at ${shop.shopName}` : "PagePrint shop",
  }
}
