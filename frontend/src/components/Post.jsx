import React, { useState } from 'react';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';

const NFTMinter = ({ generationsLeft, setGenerationsLeft }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [blockExplorerLink, setBlockExplorerLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // State for the image upload
  const [agreeToTerms, setAgreeToTerms] = useState(false); // State for the terms agreement checkbox

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    // Prepare FormData
    const formData = new FormData();
    formData.append('walletAddress', walletAddress);
    // if (selectedImage) {
    //   formData.append('image', selectedImage);
    // }

    try {
      const response = await fetch('http://localhost:3000/api/mint', {
        method: 'POST',
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();

      if (data.response?.transaction_details) {
        const { transaction_details } = data.response;
        setTransactionId(transaction_details.transactionID || '');
        setTransactionHash(transaction_details.transactionHash || '');
        setBlockExplorerLink(transaction_details.blockExplorer || '');
        setTimeout(() => {
          setGenerationsLeft(5);
        });
      } else if (data.error) {
        setError(data.error.message);
      }
    } catch (error) {
      setError('Failed to mint NFT. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            Sorry time to pay something <br />
            <a href="https://verbwire.com" className="text-blue-600 hover:text-blue-800">
              Verbwire!
            </a>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-700">
              Destination Wallet
            </label>
            <input
              id="wallet-address"
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <input
              id="image-upload"
              type="file"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="agree-to-terms"
              checked={agreeToTerms}
              onChange={() => setAgreeToTerms(!agreeToTerms)}
              className="mr-2"
              disabled={isSubmitting}
            />
            <label htmlFor="agree-to-terms" className="text-sm text-gray-700">
              I agree to provide my image to the site hoster, and they can use the image to create the NFT for themself. And, I dont own any rights for that.
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !walletAddress || !agreeToTerms || !selectedImage}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" size={20} />
                <span>Minting...</span>
              </div>
            ) : (
              'Mint NFT'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Transaction details section */}
      </div>
    </div>
  );
};

export default NFTMinter;
