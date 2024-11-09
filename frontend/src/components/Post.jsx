import React, { useState } from 'react';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';

const NFTMinter = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [blockExplorerLink, setBlockExplorerLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

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

  const checkTransactionDetails = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/transactionDetails', {
        method: 'POST',
        body: JSON.stringify({ transactionId }),
      });
      
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch transaction details');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            Sorry time to pay something <br></br>
            <a href="https://verbwire.com" className="text-blue-600 hover:text-blue-800">
              Verbwire!
            </a>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="wallet-address" 
              className="block text-sm font-medium text-gray-700"
            >
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

          <button
            type="submit"
            disabled={isSubmitting || !walletAddress}
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

        {transactionId && (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Verbwire Transaction ID:</h3>
              <p className="break-all bg-gray-50 p-2 rounded border border-gray-200">
                {transactionId}
              </p>
            </div>

            {transactionHash && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Blockchain Transaction Hash:</h3>
                <p className="break-all bg-gray-50 p-2 rounded border border-gray-200">
                  {transactionHash}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {blockExplorerLink && (
                <a
                  href={blockExplorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <button className="w-full flex items-center justify-center py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Explorer
                  </button>
                </a>
              )}
              
              <button
                onClick={checkTransactionDetails}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Transaction Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMinter;