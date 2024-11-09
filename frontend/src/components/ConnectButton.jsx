import { useConnect, useAccount } from 'wagmi';

export default function ConnectButton() {
  const { connect } = useConnect();
  const { isConnected, address } = useAccount();

  return (
    <div>
      {!isConnected ? (
        <button onClick={() => connect()}>Connect Verbwire Wallet</button>
      ) : (
        <p>Connected as: {address}</p>
      )}
    </div>
  );
}