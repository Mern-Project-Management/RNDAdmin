import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetAllCataloguesQuery } from "@/slice/catalogue/catalogueslice";

// Skeleton component for product cards
const ProductSkeleton = () => (
  <div className="overflow-hidden w-full lg:w-[250px] lg:h-[220px] md:w-full md:h-auto border animate-pulse">
    <div className="h-full flex flex-col items-center justify-between">
      <div className="w-full h-[160px] bg-gray-200"></div>
      <div className="bg-gray-400 w-full p-2 text-center h-[40px]"></div>
    </div>
  </div>
);

// Skeleton component for event card
const EventSkeleton = () => (
  <Card className="space-y-4 border p-4 animate-pulse">
    <div className="border-x border-t p-4">
      <div className="h-16 bg-gray-200"></div>
    </div>
  </Card>
);

// Skeleton component for catalogue
const CatalogueSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 w-3/4 mb-4"></div>
    <div className="h-24 bg-gray-200 w-[100px] mb-4"></div>
    <div className="h-10 bg-gray-300 w-[75%]"></div>
  </div>
);

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const { data: catalogues, isLoading: isCataloguesLoading } = useGetAllCataloguesQuery();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/chemical/latest');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.map(chemical => ({
          title: chemical.name || chemical.category,
          image: chemical.images && chemical.images.length > 0
            ? `/api/image/download/${chemical.images[0].url}`
            : '',
          slug: chemical.slug || chemical.name?.toLowerCase().replace(/\s+/g, '-') || chemical.category?.toLowerCase().replace(/\s+/g, '-'),
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchEvent = async () => {
      try {
        setIsLoading(true); // Assuming you have a loading state defined

        // Add timestamp parameter to prevent caching
        const response = await fetch(`/api/events/getEvent?t=${new Date().getTime()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }

        const data = await response.json();
        setEvent(data[0]); // Assuming the API returns an array of events
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false); // Reset loading state when done
      }
    };

    fetchProducts();
    fetchEvent();
  }, []);

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  const defaultImage = '/path/to/default/image.jpg';

  return (
    <div className="w-full flex justify-center px-4 md:px-6 lg:px-8">
      <div className="max-w-[75rem] w-full lg:px-5 py-8">
        <div className="flex flex-col lg:flex-row justify-center">
          {/* Featured Products Section */}
          <div className="flex-1 w-full">
            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 justify-center sm:justify-start">
              {isLoading ? (
                // Skeleton loaders for products
                Array(6).fill().map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              ) : (
                products.map((product, index) => (
                  <Link
                    key={index}
                    to={`/${product.slug}`}
                    className="overflow-hidden w-full lg:w-[250px] lg:h-[220px] h-[300px] md:w-full md:h-[220px] border hover:shadow-lg transition-shadow"
                  >
                    <div className="h-full flex flex-col items-center justify-between">
                      <div className="relative w-full h-[70%]  md:h-[60%]  flex items-center justify-center">
                        {product.image ? (
                          <img
                            alt={product.title}
                            className="object-contain mt-16 z-1  max-h-[300px] min-h-[150px] max-w-[300px] min-w-[150px]"
                            src={product.image}
                            loading="lazy"
                            title={product.title}
                      
                            onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                          />

                        ) : (
                          <img
                            alt={product.title}
                            className="object-contain mt-16 w-full z-1 h-full"
                            src={defaultImage}
                            loading="lazy"
                            title={product.title}
                          />
                        )}
                      </div>
                      <div className="bg-[#3B5998] w-full p-2 text-center z-2 relative" >
                        <h3 className="text-white font-medium text-sm">
                          {product.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="w-full lg:w-[30%] md:w-[100%] flex flex-col md:flex-row lg:flex-col justify-center items-center">
            {/* Forthcoming Events */}
            <div className="py-4 pl-4">
              <h2 className="text-lg font-bold mb-4">Forthcoming Events</h2>
              {isLoading ? (
                <EventSkeleton />
              ) : (
                event && (
                  <Card className="space-y-4 border p-4">
                    <div className="border-x border-t p-4">
                      <div dangerouslySetInnerHTML={{ __html: event.events }} />
                    </div>
                  </Card>
                )
              )}
            </div>

            {/* Product Catalogue */}
            <div className="sm:w-1/2 lg:w-full w-full  pl-4 md:mt-8">
              <div className="border-x border rounded-lg p-4">
                <div className="space-y-4">
                  {isCataloguesLoading ? (
                    // Skeleton loader for catalogues
                    <CatalogueSkeleton />
                  ) : (
                    catalogues && catalogues.map((catalogue, index) => (
                      <div key={index}>
                        <h3 className="text-2xl font-bold mb-4">{catalogue.title}</h3>
                        <img
                          src={`/api/image/view/${catalogue.image}`}
                          alt={catalogue.title}
                          loading="lazy"
                       className="W-[100px]"
                          onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                        />
                        <Button className="w-[75%] bg-orange-500 hover:bg-orange-600" onClick={() => window.open(`/api/image/pdf/view/${catalogue.catalogue}`, '_blank')}>
                          DOWNLOAD
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
