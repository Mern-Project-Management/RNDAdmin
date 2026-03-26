export default function ProductInfo({ productDetails, name, cas }) {
  // Filter out msds and Specs
  const filteredDetails = productDetails.filter(
    detail => !['MSDS', 'Specs'].includes(detail.label)
  );

  return (
    <>
      <h1 className="text-2xl font-bold text-blue-800 mb-6">
        {name} || {cas}
      </h1>
      <div className="grid mb-8">
        {filteredDetails.map((detail, index) => (
          <div
            key={index}
            className={`grid grid-cols-2 p-2 ${
              index % 2 === 0 ? "bg-blue-100/30" : "bg-white"
            }`}
          >
            <span className="font-medium text-sm text-blue-800">{detail.label}</span>
            <span className="font-medium text-sm">{detail.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}
  
  
